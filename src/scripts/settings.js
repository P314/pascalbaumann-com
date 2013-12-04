$(function()
{
        var scntDiv = $('#p_scents');
        init([[0,-1000],[600,-1400],[1800,180],[3082,-1400]]);
        function init(positions)
        {
                positions.forEach(function(position)
                {
                        add(position);
                });
                $(window).scroll(function ()
                {
                        var y = Math.round(getBackgroundPos($container).y);
                        $('#current_position').html('<h2><a href="#">'+getCurrentScrollPos()+','+y+'</a></h2');
                });
        }
        function add(value)
        {
                var actionContent = "";
                if (getTotal()>1)
                        actionContent = '<a href="#" class="remScnt">Remove</a></p>';
                $('<p><label for="p_scnts"><input type="text" class="p_scnt" size="20" name="p_scnt_' + getTotal() +'" value="' + value + '" placeholder="Input Value" /></label>'+actionContent).appendTo(scntDiv);
                $('.remScnt').bind('click', function()
                { 
                        if( getTotal() > 2 ) 
                                remove($(this));
                        return false;
                });
        }
        function remove(element) {
                element.parents('p').remove();
        }
        $('#addScnt').bind('click', function()
        {
                var y = Math.round(getBackgroundPos($container).y);
                add(getCurrentScrollPos()+","+y);
                return false;
        });
        $('#refresh').bind('click', function()
        {
                positions = [];
                $.each($('.p_scnt'), function(index, value)
                {
                        values = value.value.split(",");
                        positions.push(new Array(Number(values[0]),Number(values[1])));
                });
                setPositions(positions);
        });
        function getCurrentScrollPos()
        {
                return $(window).scrollTop();
        }
        function getTotal()
        {
                return $('#p_scents p').size() + 1;
        }
        function getBackgroundPos(obj)
        {
        var pos = obj.css("background-position");
        if (pos == 'undefined' || pos == null)
                pos = [obj.css("background-position-x"),obj.css("background-position-y")];
        else
                pos = pos.split(" ");
        return {
                x: parseFloat(pos[0]),
                xUnit: pos[0].replace(/[0-9-.]/g, ""),
                y: parseFloat(pos[1]),
                yUnit: pos[1].replace(/[0-9-.]/g, "")
                };
        }
});
