import os

import tensorflow.python.platform

import numpy as np
import tensorflow as tf

import matplotlib.pyplot as matplotlib
import matplotlib.cm as cm

import random

from humanIntuitionUtils import graphHelpers
from humanIntuitionUtils import extract_data
from humanIntuitionUtils import variable_summaries
from humanIntuitionUtils import init_weights

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

    # For the test data, hold the entire dataset in one constant node.
    data_node = tf.constant(data)


    # ============ Define and initialize the network.

    # This is where training samples and labels are fed to the graph.
    # These placeholder nodes will be fed a batch of training data at each
    # training step using the {feed_dict} argument to the Run() call below.
    x = tf.placeholder("float", [None, num_features])
    y = tf.placeholder("float", [None, num_labels])

    # Hidden layer with RELU activation
    layer_1_weights = init_weights('layer_1_weights', [num_features, hidden_layer_size_1], 'uniform')
    layer_1_biases = init_weights('layer_1_biases', [1, hidden_layer_size_1], 'zeros')
    layer_1 = tf.add(tf.matmul(x, layer_1_weights), layer_1_biases)
    layer_1 = tf.nn.relu(layer_1)

    # Hidden layer with linear activation
    layer_2_weights = init_weights('layer_2_weights', [hidden_layer_size_1, num_labels], 'uniform')
    layer_2_biases = init_weights('layer_2_biases', [1, num_labels], 'zeros')
    layer_2_output = tf.add(tf.matmul(layer_1, layer_2_weights), layer_2_biases)


    # ============ LOSS AND OPTIMIZATION

    cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(layer_2_output, y))
    optimizer = tf.train.AdamOptimizer(learning_rate=LEARNING_RATE).minimize(cost)

    # Test model
    correct_prediction = tf.equal(tf.argmax(layer_2_output, 1), tf.argmax(y, 1))
    # Calculate accuracy
    accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))


    # ============ SUMMARIES AND METRICS =============

    # summary
    tf.summary.scalar('accurarcy', accuracy)
    summary_op = tf.summary.merge_all()

    # Input Importance Measurement -> Scheme A
    A_outputFilterMatrix = tf.constant([[1.0, 0.0]])

    A_layer2Importance = tf.matmul(A_outputFilterMatrix, tf.transpose(layer_2_weights))
    A_layer2Importance_avg = tf.scalar_mul(1 / tf.reduce_sum(A_layer2Importance), A_layer2Importance)

    A_inputImportance = tf.matmul(A_layer2Importance_avg, tf.transpose(layer_1_weights))
    A_inputImportance_avg = tf.scalar_mul(1 / tf.reduce_sum(A_inputImportance), A_inputImportance)


    # ============ Create a local session to run this computation.

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


        font = {'size' : 22}
        matplotlib.rc('font', **font)

        fig, plots = matplotlib.subplots(1, figsize=(20, 6))

        matplotlib.setp(plots, xticks=graphHelpers['xTicks'], xticklabels=graphHelpers['xLabels'], yticks=graphHelpers['yTicks'], yticklabels=graphHelpers['yLabels'])
        matplotlib.subplots_adjust(hspace=0.5, top=0.85)

        plots.set_title("Two Hidden Layers : Scheme A -> Input Importance", y=1.06)
        plots.invert_yaxis();
        plots.pcolor(sess.run(A_inputImportance_avg).reshape(7,26), cmap=cm.gray)

        if not os.path.exists('images'):
            os.makedirs('images')

        fig.savefig('images/weights_layers_two.png')

        print "Train Accuracy:", accuracy.eval({x: data, y: labels})
        print "Accuracy:", accuracy.eval({x: testData, y: testLabels})


# =========== A WAY TO LAUNCH AND TAKE ADVANTAGE OF PYTHON TO SETUP A MAIN MEHTOD ============

if __name__ == '__main__':
    tf.app.run()