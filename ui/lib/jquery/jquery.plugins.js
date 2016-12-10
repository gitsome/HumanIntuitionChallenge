(function ($) {
    
    $.fn.removeStyle = function(style_in) {
        
        var search = new RegExp(style_in + '[^;]+;?', 'g');

        return this.each(function() {
            $(this).attr('style', function(i, styleAttr) {
                styleAttr = styleAttr || "";
                return styleAttr.replace(search, '');
            });
        });
    };

})(jQuery);