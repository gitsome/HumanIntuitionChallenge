module.exports = function(app, routeAPI){

    /*============ DEPENDENCIES ============*/

    /*============ PRIVATE VARIABLES/METHODS ============*/

    var services = routeAPI.services;
    var server = routeAPI.server;


    /*==================================== INDEX PAGE ====================================*/

    app.use(function(req, res) {

        res.render('index', {
            title: 'Machine Learning',
            session: {
                mode: services.mode.get()
            }
        });
    });

};