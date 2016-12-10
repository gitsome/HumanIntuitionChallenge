import tensorflow.python.platform

import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

import random

from humanIntuitionUtils import graphHelpers
from humanIntuitionUtils import extract_data
from humanIntuitionUtils import variable_summaries
from humanIntuitionUtils import init_weights
from humanIntuitionUtils import multilayer_perceptron

# Original from https://github.com/jasonbaldridge/try-tf/

# set seed if required
# random.seed(15)
# tf.set_random_seed(15)

# Global variables.
BATCH_SIZE = 1  # The number of training examples to use per training step.
PERCENT_TRAINING = 0.5;
LEARNING_RATE = 0.02;
RUN_INTEGER = random.randint(0,9999999)

# Define the flags useable from the command line.
tf.app.flags.DEFINE_string('data','./server/exports/mlData.json', 'File containing the data, labels, features.')
tf.app.flags.DEFINE_integer('num_epochs', 1, 'Number of examples to separate from the training data for the validation set.')
tf.app.flags.DEFINE_boolean('verbose', False, 'Produce verbose output.')
FLAGS = tf.app.flags.FLAGS


def main(argv=None):
    # Be verbose?
    verbose = FLAGS.verbose

    # Get the data.
    data_filename = FLAGS.data

    # Extract it into numpy arrays.
    data, labels, testData, testLabels, labels_map = extract_data(data_filename, PERCENT_TRAINING)

    # Get the shape of the training data.
    data_size, num_features = data.shape
    testData_size, num_testData_features = testData.shape

    num_labels = len(labels_map)

    print "data shape: " + str(num_features)
    print "train data rows: " + str(data_size)
    print "test data rows: " + str(testData_size)
    print "total labels: " + str(num_labels)

    # Get the number of epochs for training.
    num_epochs = FLAGS.num_epochs

    # Get the size of layer one.
    hidden_layer_size_1 = num_features
    hidden_layer_size_2 = num_features

    # This is where training samples and labels are fed to the graph.
    # These placeholder nodes will be fed a batch of training data at each
    # training step using the {feed_dict} argument to the Run() call below.
    x = tf.placeholder("float", shape=[None, num_features], name="x")
    y_ = tf.placeholder("float", shape=[None, num_labels], name="y")

    # For the test data, hold the entire dataset in one constant node.
    data_node = tf.constant(data)

    # Define and initialize the network.

    # tf Graph input
    x = tf.placeholder("float", [None, num_features])
    y = tf.placeholder("float", [None, num_labels])

    # Store layers weight & bias
    weights = {
        'h1': init_weights('w1', [num_features, hidden_layer_size_1], 'uniform'),
        'h2': init_weights('w2', [hidden_layer_size_1, hidden_layer_size_2], 'uniform'),
        'out': init_weights('wOut', [hidden_layer_size_2, num_labels], 'uniform')
    }
    biases = {
        'b1': init_weights('b1', [1, hidden_layer_size_1], 'zeros'),
        'b2': init_weights('b2', [1, hidden_layer_size_2], 'zeros'),
        'out': init_weights('bOut', [1, num_labels], 'zeros')
    }

    # Construct model
    pred = multilayer_perceptron(x, weights, biases)

    # Define loss and optimizer
    cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(pred, y))
    optimizer = tf.train.AdamOptimizer(learning_rate=LEARNING_RATE).minimize(cost)

    # Test model
    correct_prediction = tf.equal(tf.argmax(pred, 1), tf.argmax(y, 1))
    # Calculate accuracy
    accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))

    #summary
    tf.summary.scalar('accurarcy', accuracy)
    summary_op = tf.summary.merge_all()

    # Create a local session to run this computation.
    with tf.Session() as sess:
        # Run all the initializers to prepare the trainable parameters.
        tf.global_variables_initializer().run()

        writer = tf.train.SummaryWriter('./logs/' + str(RUN_INTEGER), sess.graph)

        # Iterate and train.
        for step in xrange(num_epochs * data_size // BATCH_SIZE):
            if verbose:
                print step,

            offset = (step * BATCH_SIZE) % data_size
            batch_data = data[offset:(offset + BATCH_SIZE), :]
            batch_labels = labels[offset:(offset + BATCH_SIZE)]

            sess.run([optimizer, cost], feed_dict={x: batch_data, y: batch_labels})

            summary = sess.run(summary_op, feed_dict={x: testData, y: testLabels})
            writer.add_summary(summary, step)


        fig, plots = plt.subplots(1)

        plt.setp(plots, xticks=graphHelpers['xTicks'], xticklabels=graphHelpers['xLabels'], yticks=graphHelpers['yTicks'], yticklabels=graphHelpers['yLabels'])

        plots.set_title("Input Weights")

        plt.subplots_adjust(hspace=0.5)

        plots.invert_yaxis()
        plots.pcolor(sess.run(weights['h1'])[:,1].reshape(7,26))

        fig.savefig('weights.png')


        print "Accuracy:", accuracy.eval({x: testData, y: testLabels})


# =========== A WAY TO LAUNCH AND TAKE ADVANTAGE OF PYTHON TO SETUP A MAIN MEHTOD ============

if __name__ == '__main__':
    tf.app.run()