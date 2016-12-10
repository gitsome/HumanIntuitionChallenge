
import json
import numpy as np
import tensorflow as tf

graphHelpers = {
    "xTicks": [0.5,1.5,2.5,3.5,4.5,5.5,6.5,7.5,8.5,9.5,10.5,11.5,12.5,13.5,14.5,15.5,16.5,17.5,18.5,19.5,20.5,21.5,22.5,23.5,24.5,25.5],
    "xLabels": ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    "yTicks": [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5],
    "yLabels": [1,2,3,4,5,6,7]
}

# Extract numpy representations of the labels and features
def extract_data(filename, PERCENT_TESTING):

    trainLabels = []
    trainVecs = []

    testLabels = []
    testVecs = []

    with open(filename) as data_file:
        fileData = json.load(data_file)

    labels_map = fileData["labelMap"]

    totalRows = len(fileData["data"])
    maxTrainingIndex = int(round(totalRows * PERCENT_TESTING, 0))

    for fileDataEntryIndex in range(0, maxTrainingIndex):
        fileDataEntry = fileData["data"][fileDataEntryIndex]
        trainLabels.append(int(fileDataEntry["label"]))
        trainVecs.append([float(x) for x in fileDataEntry["oneHotValue"]])

    for fileDataEntryIndex in range(maxTrainingIndex, totalRows):
        fileDataEntry = fileData["data"][fileDataEntryIndex]
        testLabels.append(int(fileDataEntry["label"]))
        testVecs.append([float(x) for x in fileDataEntry["oneHotValue"]])


    # Convert the array of float arrays into a numpy float matrix.
    trainVecs_np = np.matrix(trainVecs).astype(np.float32)
    # Convert the array of int labels into a numpy array.
    trainLabels_np = np.array(trainLabels).astype(dtype=np.uint8)
    # Convert the int numpy array into a one-hot matrix.
    trainLabels_onehot = (np.arange(len(labels_map)) == trainLabels_np[:, None]).astype(np.float32)

    # Convert the array of float arrays into a numpy float matrix.
    testVecs_np = np.matrix(testVecs).astype(np.float32)
    # Convert the array of int labels into a numpy array.
    testLabels_np = np.array(testLabels).astype(dtype=np.uint8)
    # Convert the int numpy array into a one-hot matrix.
    testLabels_onehot = (np.arange(len(labels_map)) == testLabels_np[:, None]).astype(np.float32)

    # Return a pair of the feature matrix and the one-hot label matrix.
    return trainVecs_np, trainLabels_onehot, testVecs_np, testLabels_onehot, labels_map


"""Attach a lot of summaries to a Tensor (for TensorBoard visualization)."""
def variable_summaries(var, name):

    with tf.name_scope(name):
        mean = tf.reduce_mean(var)
        tf.summary.scalar('mean', mean)

        with tf.name_scope('stddev'):

            stddev = tf.sqrt(tf.reduce_mean(tf.square(var - mean)))

        tf.summary.scalar('stddev', stddev)
        tf.summary.scalar('max', tf.reduce_max(var))
        tf.summary.scalar('min', tf.reduce_min(var))
        tf.summary.histogram('histogram', var)


# Create model
def multilayer_perceptron(x, weights, biases):
    # Hidden layer with RELU activation
    layer_1 = tf.add(tf.matmul(x, weights['h1']), biases['b1'])
    layer_1 = tf.nn.relu(layer_1)
    # Hidden layer with RELU activation
    layer_2 = tf.add(tf.matmul(layer_1, weights['h2']), biases['b2'])
    layer_2 = tf.nn.relu(layer_2)
    # Output layer with linear activation
    out_layer = tf.matmul(layer_2, weights['out']) + biases['out']
    return out_layer


# Init weights method. (Lifted from Delip Rao: http://deliprao.com/archives/100)
def init_weights(namespace, shape, init_method='xavier', xavier_params = (None, None)):
    if init_method == 'zeros':
        return tf.Variable(tf.zeros(shape, dtype=tf.float32), name=namespace + '_hidden_W')
    elif init_method == 'uniform':
        return tf.Variable(tf.random_normal(shape, stddev=0.01, dtype=tf.float32), name=namespace + '_hidden_W')
    else: #xavier
        (fan_in, fan_out) = xavier_params
        low = -4*np.sqrt(6.0/(fan_in + fan_out)) # {sigmoid:4, tanh:1}
        high = 4*np.sqrt(6.0/(fan_in + fan_out))
        return tf.Variable(tf.random_uniform(shape, minval=low, maxval=high, dtype=tf.float32), name=namespace + '_hidden_W')