import numpy as np
import random

import tensorflow.python.platform
import tensorflow as tf
import matplotlib.pyplot as plt

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
LEARNING_RATE = 0.2
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
    output_biases = init_weights('bOut', [1, num_labels], 'zeros')


    # =========== SINGLE HIDDEN LAYER TRACK ============

    single_weights = init_weights('single_weights', [num_features, num_labels], 'uniform')

    # NOTE: Not currently using relu after
    hidden_single = tf.add(tf.matmul(x, single_weights), output_biases);


    # =========== MULTI LAYER TRACK ============

    multi_weights = {
        'h1': init_weights('w1', [num_features, num_features], 'uniform'),
        'h2': init_weights('w2', [num_features, num_labels], 'uniform')
    }
    multi_biases = {
        'b1': init_weights('b1', [1, num_features], 'zeros'),
        'b2': output_biases
    }

    # Hidden layer 1 with RELU activation
    multi_layer_1 = tf.add(tf.matmul(x, multi_weights['h1']), multi_biases['b1'])
    multi_layer_1 = tf.nn.relu(multi_layer_1)

    # Hidden layer 2 with RELU activation
    multi_layer_2 = tf.add(tf.matmul(multi_layer_1, multi_weights['h2']), multi_biases['b2'])
    multi_layer_2 = tf.nn.relu(multi_layer_2)


    # =========== MERGE MULTIPLE TRACKS ============

    hidden_combined = tf.add(hidden_single, multi_layer_2)

    # The output layer.
    y = tf.nn.softmax(hidden_combined);

    # Optimization.
    cross_entropy = -tf.reduce_sum(y_*tf.log(y))
    train_step = tf.train.GradientDescentOptimizer(LEARNING_RATE).minimize(cross_entropy)

    # Evaluation.
    correct_prediction = tf.equal(tf.argmax(y,1), tf.argmax(y_,1))
    accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))


    # =========== SETUP AND INITIALIZE SUMMARY ============

    tf.summary.scalar('accurarcy', accuracy)

    summary_op = tf.summary.merge_all()


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

        print "Train Accuracy:", accuracy.eval(feed_dict={x: data, y_: labels})
        print "Test Accuracy:", accuracy.eval(feed_dict={x: testData, y_: testLabels})


# =========== A WAY TO LAUNCH AND TAKE ADVANTAGE OF PYTHON TO SETUP A MAIN MEHTOD ============

if __name__ == '__main__':
    tf.app.run()