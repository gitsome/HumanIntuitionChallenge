import tensorflow.python.platform

import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

import random

from humanIntuitionUtils import graphHelpers
from humanIntuitionUtils import extract_data
from humanIntuitionUtils import variable_summaries
from humanIntuitionUtils import init_weights

# Original from https://github.com/jasonbaldridge/try-tf/

# set seed if required
# random.seed(15)
# tf.set_random_seed(15)

# Global variables.
BATCH_SIZE = 1  # The number of training examples to use per training step. We use 1 to simulate an individual updating their personal neural networks one example at a time
PERCENT_TESTING = 0.5;
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
    data, labels, testData, testLabels, labels_map = extract_data(data_filename, PERCENT_TESTING)

    data_size, num_features = data.shape
    testData_size, num_testData_features = testData.shape

    num_labels = len(labels_map)

    print "data shape: " + str(num_features)
    print "train data rows: " + str(data_size)
    print "test data rows: " + str(testData_size)
    print "total labels: " + str(num_labels)

    # Get the number of epochs for training.
    num_epochs = FLAGS.num_epochs

    # This is where training samples and labels are fed to the graph.
    # These placeholder nodes will be fed a batch of training data at each
    # training step using the {feed_dict} argument to the Run() call below.
    x = tf.placeholder("float", shape=[None, num_features], name="x")
    y_ = tf.placeholder("float", shape=[None, num_labels], name="y")

    # For the test data, hold the entire dataset in one constant node.
    data_node = tf.constant(data)

    # Define and initialize the network.

    # Initialize the hidden weights and biases.
    w_hidden = init_weights('w_hidden', [num_features, num_labels], 'uniform')
    b_hidden = init_weights('b_hidden', [1, num_labels], 'zeros')

    # The hidden layer.
    hidden = tf.matmul(x,w_hidden) + b_hidden;

    # The output layer.
    y = tf.nn.softmax(hidden);

    # Optimization.
    cross_entropy = -tf.reduce_sum(y_*tf.log(y))
    train_step = tf.train.GradientDescentOptimizer(0.03).minimize(cross_entropy)

    # Evaluation.
    correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))
    accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))

    tf.summary.scalar('accurarcy', accuracy)

    #summary
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

            _  = sess.run([train_step], feed_dict={x: batch_data, y_: batch_labels})
            summary = sess.run(summary_op, feed_dict={x: testData, y_: testLabels})
            writer.add_summary(summary, step)


        fig, plots = plt.subplots(2)

        plt.setp(plots, xticks=graphHelpers['xTicks'], xticklabels=graphHelpers['xLabels'], yticks=graphHelpers['yTicks'], yticklabels=graphHelpers['yLabels'])

        plots[0].set_title("Schema A")
        plots[1].set_title("Schema B")

        plt.subplots_adjust(hspace=0.5)

        for i in range(2):
            # NOTE [:,i] is all rows in column i
            # This would be getting all weights from hidden layer to the ith label
            plots[i].invert_yaxis()
            plots[i].pcolor(sess.run(w_hidden)[:,i].reshape(7,26))

        fig.savefig('weights.png')

        print "Train Accuracy:", accuracy.eval(feed_dict={x: data, y_: labels})
        print "Test Accuracy:", accuracy.eval(feed_dict={x: testData, y_: testLabels})


# =========== A WAY TO LAUNCH AND TAKE ADVANTAGE OF PYTHON TO SETUP A MAIN MEHTOD ============

if __name__ == '__main__':
    tf.app.run()