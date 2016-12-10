
var d3 = d3 || {};

(function () {

    angular.module('MachineLearning').directive('mlSchemesTestReportGraph', function () {

        return {

            restrict: 'E',

            scope: {
                answers: '=',
                maxTries: '=',
                intervalLength: '=',
                percentThreshold: '=',
                schemesCount: '='
            },

            controller: [

                '$scope',
                '$element',
                '$timeout',

                function ($scope, $element, $timeout) {

                    $scope.svgHeight = 400;

                    /*=============== PRIVATE VARIABLES AND METHODS ============*/

                    var updateGraph;
                    var answerProgressData = [];
                    var intervalPercentData = [];

                    var margin = {top: 30, right: 80, bottom: 45, left: 45};

                    var totalWidth = 0;
                    var totalHeight = 0;

                    var graphWidth = 0;
                    var graphHeight = 0;

                    var animTime = 1500;


                    var getIntervalPercent = function (data, startIndex, endIndex) {

                        if (startIndex < 0) {

                            return (1 / $scope.schemesCount);

                        } else {

                            var intervalLength = endIndex - startIndex;

                            return _.reduce(data.slice(startIndex, startIndex + intervalLength), function (memo, value) {
                                return memo + value;
                            }, 0) / (intervalLength);
                        }
                    };


                    var updateData = function () {

                        answerProgressData = [];
                        intervalPercentData = [];

                        var currentTotal = 0;

                        _.each($scope.answers, function (answer, i) {
                            if (answer) {
                                currentTotal = currentTotal + 1;
                            } else {
                                currentTotal = currentTotal - 1;
                            }
                            answerProgressData.push(currentTotal);
                            intervalPercentData.push(Math.round(100 * getIntervalPercent($scope.answers, i - $scope.intervalLength, i)));
                        });
                    };

                    var updateDimensions = function () {

                        totalWidth = $element.width();
                        totalHeight = $scope.svgHeight;

                        graphWidth = totalWidth - margin.left - margin.right;
                        graphHeight =  totalHeight - margin.top - margin.bottom;
                    };


                    /*============ THE MAIN RENDER METHOD WHEN THINGS CHANGE ================*/

                    updateGraph = function () {

                        updateData();

                        updateDimensions();

                        var svg = d3.select($scope.svg);
                        var barsArea = svg.select('.bars');

                        var xScale = d3.scale.linear()
                            .domain([0, answerProgressData.length - 1])
                            .range([0, graphWidth]);


                        var minAnswerProgress = d3.min(answerProgressData, function (d) {
                            return d;
                        });
                        var maxAnswerProgress = d3.max(answerProgressData, function (d) {
                            return d;
                        });

                        var yScale = d3.scale.linear()
                            .domain([minAnswerProgress, maxAnswerProgress])
                            .range([graphHeight, 0]);

                        var startingLine = d3.svg.line()
                            .x(function(d, i) { return xScale(i); })
                            .y(function(d) { return yScale(0); })
                            .interpolate("basis");

                        var endingLine = d3.svg.line()
                            .x(function(d, i) { return xScale(i); })
                            .y(function(d) { return yScale(d); })
                            .interpolate("basis");


                        var minIntervalPercent = d3.min(intervalPercentData, function (d) {
                            return d;
                        });
                        var maxIntervalPercent = d3.max(intervalPercentData, function (d) {
                            return d;
                        });

                        var yPercentScale = d3.scale.linear()
                            .domain([0, 100])
                            .range([graphHeight, 0]);

                        var startingPercentLine = d3.svg.line()
                            .x(function(d, i) { return xScale(i); })
                            .y(function(d) { return yPercentScale((100 / $scope.schemesCount)); })
                            .interpolate("basis");

                        var endingPercentLine = d3.svg.line()
                            .x(function(d, i) { return xScale(i); })
                            .y(function(d) { return yPercentScale(d); })
                            .interpolate("basis");


                        var xAxis = d3.svg.axis().scale(xScale)
                            .orient("bottom").ticks(answerProgressData.length > 20 ? 10 : 5)
                            .tickFormat(function(d,i){ return d + 1; });

                        var yAxis = d3.svg.axis().scale(yScale)
                            .orient("left").ticks(5);

                        var axesArea = svg.select('.axes-area');
                        var progressArea = svg.select('.progress-area');
                        var intervalArea = svg.select('.interval-area');

                        axesArea.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
                        progressArea.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
                        intervalArea.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

                        // Add the X Axis
                        axesArea.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + graphHeight + ")")
                            .call(xAxis);

                        axesArea.append("g")
                            .attr("class", "y axis")
                            .call(yAxis);

                        var halfPercentInterval = intervalArea.append("g")
                            .attr("class", "axis y-percent y-percent-random");

                            halfPercentInterval.append('line')
                                .style("stroke-dasharray", ("10, 8"))
                                .attr('stroke-width', '1.5')
                                .attr('x1', xScale(0))
                                .attr('y1', yPercentScale(Math.round(100 / $scope.schemesCount)))
                                .attr('x2', xScale(answerProgressData.length - 1))
                                .attr('y2', yPercentScale(Math.round(100 / $scope.schemesCount)));

                            halfPercentInterval.append('text')
                                .attr("x", graphWidth + 15)
                                  .attr("y", yPercentScale(Math.round(100 / $scope.schemesCount)) + 8)
                                  .text(Math.round(100 / $scope.schemesCount) + '%')
                                  .attr("font-family", "sans-serif")
                                  .attr("font-size", "24px")
                                  .attr("fill", "#BD7435");

                        var thresholdPercentInterval = intervalArea.append("g")
                            .attr("class", "axis y-percent y-percent-threshold");

                            thresholdPercentInterval.append('line')
                                .style("stroke-dasharray", ("10, 8"))
                                .attr('stroke-width', '3')
                                .attr('x1', xScale(0))
                                .attr('y1', yPercentScale($scope.percentThreshold))
                                .attr('x2', xScale(answerProgressData.length - 1))
                                .attr('y2', yPercentScale($scope.percentThreshold));

                            thresholdPercentInterval.append('text')
                                .attr("x", graphWidth + 15)
                                  .attr("y", yPercentScale($scope.percentThreshold) + 8)
                                  .text($scope.percentThreshold + '%')
                                  .attr("font-family", "sans-serif")
                                  .attr("font-size", "24px")
                                  .attr("fill", "#BD7435");


                        /*============ CUMULIATIVE SCORE ==============*/

                        var progressLine = progressArea.selectAll('path.progress-line')
                            .data([answerProgressData]);

                        var progressLineEnter = progressLine.enter().append('path')
                            .attr('class', 'progress-line')
                            .attr('stroke', '#428bca')
                            .attr('fill', 'none')
                            .attr('stroke-width', '2')
                            .attr('d', startingLine);

                        var progressLineUpdate = progressLine.transition().duration(animTime);

                        progressLineUpdate
                            .attr('d', endingLine);


                        /*============ INTERVAL PERCENT ==============*/

                        var intervalPercentLine = intervalArea.selectAll('path.interval-line')
                            .data([intervalPercentData]);

                        var intervalPercentLineEnter = intervalPercentLine.enter().append('path')
                            .attr('class', 'interval-line')
                            .attr('stroke', '#BD7435')
                            .attr('fill', 'none')
                            .attr('stroke-width', '3')
                            .attr('d', startingPercentLine);

                        var intervalPercentLineUpdate = intervalPercentLine.transition().duration(animTime);

                        intervalPercentLineUpdate
                            .attr('d', endingPercentLine);
                    };


                    /*============ MODEL ============*/

                    $scope.svg = $element.find('svg')[0];


                    /*=============== MODEL DEPENDENT METHODS ============*/


                    /*=============== BEHAVIOR ============*/

                    /*=============== LISTENERS ==============*/


                    /*=============== INITIALIZATION ==============*/

                    $timeout(updateGraph, 1);
                }
            ],

            template: [

                '<svg class="ml-report-graph" height="400">',
                    '<g class="axes-area"></g>',
                    '<g class="interval-area"></g>',
                    '<g class="progress-area"></g>',
                '</svg>',

                '<div class="legend">',
                    '<span class="legend-item legend-item-score">',
                        '<i class="fa fa-square"></i> Cumulative Correct Answers',
                    '</span>',
                    '<span class="legend-item legend-item-interval-percent">',
                        '<i class="fa fa-square"></i> ( {{intervalLength}} ) Interval Percent Correct ',
                    '</span>',
                '</div>'

            ].join('')
        };
    });

})();