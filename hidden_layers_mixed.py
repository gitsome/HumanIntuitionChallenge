import os

import numpy as np
import random

import tensorflow.python.platform
import tensorflow as tf

import matplotlib.pyplot as matplotlib
import matplotlib.cm as cm

from humanIntuitionUtils import graphHelpers
from humanIntuitionUtils import extract_data
from humanIntuitionUtils import variable_summaries
from humanIntuitionUtils import init_weights
from humanIntuitionUtils import multilayer_perceptron

# Original from https://github.com/jasonbaldridge/try-tf/

# SET SEEDS IF NEEDED FOR TESTING
# random.seed(15)
# tf.set_random_seed(15)

# GLOBAL VARIABLES
BATCH_SIZE = 1  # The number of training examples to use per training step. We use 1 to simulate an individual updating their personal neural networks one example at a time
PERCENT_TESTING = 0.5
LEARNING_RATE = 0.25
RUN_INTEGER = random.randint(0,9999999)

# Define the flags useable from the command line.
tf.app.flags.DEFINE_string('data','./server/exports/mlData.json', 'File containing the data, labels, features.')
tf.app.flags.DEFINE_integer('num_epochs', 1, 'Number of examples to separate from the training data for the validation set.')
tf.app.flags.DEFINE_boolean('verbose', False, 'Produce verbose output.')

FLAGS = tf.app.flags.FLAGS


def main(argv=None):

    verbose = FLAGS.verbose
    num_epochs = FLAGS.num_epochs

    # =========== IMPORT DATA ============

    data_filename = FLAGS.data

    # Extract it into numpy arrays.
    data, labels, testData, testLabels, labels_map = extract_data(data_filename, PERCENT_TESTING)

    data_size, num_features = data.shape
    testData_size, num_testData_features = testData.shape

    # Matrix dimensions
    num_labels = len(labels_map)

    print "data shape: " + str(num_features)
    print "train data rows: " + str(data_size)
    print "test data rows: " + str(testData_size)
    print "total labels: " + str(num_labels)


    # =========== INPUT AND FINAL OUTPUT ============

    # This is where training samples and labels are fed to the graph.
    # These placeholder nodes will be fed a batch of training data at each
    # training step using the {feed_dict} argument to the Run() call below.
    x = tf.placeholder("float", shape=[None, num_features], name="x")
    y_ = tf.placeholder("float", shape=[None, num_labels], name="y")

    # For the test data, hold the entire dataset in one constant node.
    data_node = tf.constant(data)

    # The output biases are used for both tracks
    output_biases = init_weights('output_biases', [1, num_labels], 'zeros')


    # =========== MULTI LAYER CHANNEL 1 ============

    c1_layer1_size = num_features
    c1_layer2_size = num_features
    c1_layer3_size = num_features

    # Channel 1 Hidden layer 1 with RELU activation
    c1_layer1_weights = init_weights('c1_layer1_weights', [num_features, c1_layer1_size], 'uniform')
    c1_layer1_biases = init_weights('c1_layer1_biases', [1, c1_layer1_size], 'zeros')

    c1_layer1 = tf.add(tf.matmul(x, c1_layer1_weights), c1_layer1_biases)
    c1_layer1 = tf.nn.relu(c1_layer1)


    # Channel 1 Hidden layer 2 with RELU activation
    c1_layer2_weights = init_weights('c1_layer2_weights', [c1_layer1_size, c1_layer2_size], 'uniform')
    c1_layer2_biases = init_weights('c1_layer2_biases', [1, c1_layer2_size], 'zeros')

    c1_layer2 = tf.add(tf.matmul(c1_layer1, c1_layer2_weights), c1_layer2_biases)
    c1_layer2 = tf.nn.relu(c1_layer2)


    # Channel 1 Hidden layer 3 with RELU activation
    c1_layer3_weights = init_weights('c1_layer3_weights', [c1_layer2_size, num_labels], 'uniform')
    c1_layer3_biases = output_biases

    c1_layer3 = tf.add(tf.matmul(c1_layer2, c1_layer3_weights), c1_layer3_biases)
    c1_layer3 = tf.nn.relu(c1_layer3)


    # =========== SINGLE HIDDEN LAYER CHANNEL 2 ============

    c2_layer1_weights = init_weights('c2_layer1_weights', [num_features, num_labels], 'uniform')

    c2_output = tf.add(tf.matmul(x, c2_layer1_weights), output_biases);


    # =========== MERGE MULTIPLE TRACKS ============

    hidden_combined = tf.add(c1_layer3, c2_output)

    # The output layer.
    y = tf.nn.softmax(hidden_combined);

    # Optimization.
    cross_entropy = -tf.reduce_sum(y_*tf.log(y))
    train_step = tf.train.GradientDescentOptimizer(LEARNING_RATE).minimize(cross_entropy)

    # Evaluation.
    correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))
    accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))


    # =========== INITIALIZATION SETUP ============

    # Summary
    tf.summary.scalar('accurarcy', accuracy)
    summary_op = tf.summary.merge_all()

    # Input Importance Measurements For Class A
    A_outputFilterMatrix = tf.constant([[1.0, 0.0]])

    # Channel 1
    A_inputImportanceC1_layer3 = tf.matmul(A_outputFilterMatrix, tf.transpose(c1_layer3_weights))
    A_inputImportanceC1_layer3_avg = tf.scalar_mul(1 / tf.reduce_sum(A_inputImportanceC1_layer3), A_inputImportanceC1_layer3)

    A_inputImportanceC1_layer2 = tf.matmul(A_inputImportanceC1_layer3_avg, tf.transpose(c1_layer2_weights))
    A_inputImportanceC1_layer2_avg = tf.scalar_mul(1 / tf.reduce_sum(A_inputImportanceC1_layer2), A_inputImportanceC1_layer2)

    A_inputImportanceC1 = tf.matmul(A_inputImportanceC1_layer2_avg, tf.transpose(c1_layer1_weights))
    A_inputImportanceC1_avg = tf.scalar_mul(1 / tf.reduce_sum(A_inputImportanceC1), A_inputImportanceC1)

    # Channel 2
    A_inputImportanceC2 = tf.matmul(A_outputFilterMatrix, tf.transpose(c2_layer1_weights))
    A_inputImportanceC2_avg = tf.scalar_mul(1 / tf.reduce_sum(A_inputImportanceC2), A_inputImportanceC2)


    # =========== RUN THE SESSION ============

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

        font = {'size' : 22}
        matplotlib.rc('font', **font)

        fig, plots = matplotlib.subplots(2, figsize=(20, 12))

        matplotlib.setp(plots, xticks=graphHelpers['xTicks'], xticklabels=graphHelpers['xLabels'], yticks=graphHelpers['yTicks'], yticklabels=graphHelpers['yLabels'])
        matplotlib.subplots_adjust(hspace=0.5)

        plots[0].set_title("Multi Channel NN : Scheme A -> Input Importance Channel 1", y=1.06)
        plots[0].invert_yaxis();
        plots[0].pcolor(sess.run(A_inputImportanceC1_avg).reshape(7,26), cmap=cm.gray)

        plots[1].set_title("Multi Channel NN : Scheme A -> Input Importance Channel 2", y=1.06)
        plots[1].invert_yaxis();
        plots[1].pcolor(sess.run(A_inputImportanceC2_avg).reshape(7,26), cmap=cm.gray)


        if not os.path.exists('images'):
            os.makedirs('images')

        fig.savefig('images/weights_layers_mixed.png')


        print "Train Accuracy:", accuracy.eval(feed_dict={x: data, y_: labels})
        print "Test Accuracy:", accuracy.eval(feed_dict={x: testData, y_: testLabels})


# =========== A WAY TO LAUNCH AND TAKE ADVANTAGE OF PYTHON TO SETUP A MAIN MEHTOD ============

if __name__ == '__main__':
    tf.app.run()