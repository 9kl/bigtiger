+(function($) {
    // "use strict";

    var QuickDateSelector = function(element, options) {
        this.$element = $(element);
        this.$wdatePickerBegin = this.$element.find('[data-wdatePicker="begin"]');
        this.$wdatePickerEnd = this.$element.find('[data-wdatePicker="end"]');
        this.$daterangeHumanize = this.$element.find('.daterange-humanize');

        this.options = $.extend({}, this.getDefaults(), this.$element.data(), options);
    };

    QuickDateSelector.VERSION = '0.0.1';

    QuickDateSelector.DEFAULTS = {
        datefmt: 'yyyy-MM-dd HH',
        begindate: moment(),
        enddate: moment()
    };

    QuickDateSelector.prototype.getDefaults = function() {
        return QuickDateSelector.DEFAULTS;
    };

    QuickDateSelector.prototype.init = function() {
        this.$wdatePickerBegin.val(this.options.begindate);
        this.$wdatePickerEnd.val(this.options.enddate);

        if (this.options.humanize) {
            this.$daterangeHumanize.val(this.options.humanize);
        } else {
            this.updateDateRange();
        }
    };

    QuickDateSelector.prototype.quickChangDate = function(value) {
        var beginDate = moment(),
            endDate = moment(),
            daterangeHumanize = '';

        switch (value) {
            case 'R7':
                // 近30分钟
                beginDate.subtract(30, 'minutes');
                daterangeHumanize = '最近30分钟';
                break;
            case 'R8':
                // 近1小时
                beginDate.subtract(1, 'hours');
                daterangeHumanize = '最近1小时';
                break;
            case 'R9':
                // 近3小时
                beginDate.subtract(3, 'hours');
                daterangeHumanize = '最近3小时';
                break;
            case 'R10':
                // 近6小时
                beginDate.subtract(6, 'hours');
                daterangeHumanize = '最近6小时';
                break;
            case 'R11':
                // 近12小时
                beginDate.subtract(12, 'hours');
                daterangeHumanize = '最近12小时';
                break;
            case 'R12':
                // 近24小时
                beginDate.subtract(24, 'hours');
                daterangeHumanize = '最近24小时';
                break;
            case 'R1':
                // 今日
                var h = beginDate.hours();
                if (h < 8) {
                    beginDate.subtract(1, 'days');
                    daterangeHumanize = "昨日8时到现在";
                } else {
                    endDate.add(1, 'days');
                    daterangeHumanize = '今日8时到现在';
                }
                beginDate.hour(8);
                beginDate.minute(0);
                beginDate.second(0);
                endDate.hour(8);
                endDate.minute(0);
                endDate.second(0);
                break;
            case 'R2':
                // 昨日
                var h = beginDate.hours();
                if (h < 8) {
                    beginDate.subtract(2, 'days');
                    endDate.subtract(1, 'days');
                    daterangeHumanize = '昨日（前天8时到昨天8时）';
                } else {
                    beginDate.subtract(1, 'days');
                    daterangeHumanize = '昨日（昨日8时到今日8时）';
                }
                beginDate.hour(8);
                beginDate.minute(0);
                beginDate.second(0);
                endDate.hour(8);
                endDate.minute(0);
                endDate.second(0);
                break;
            case 'R3':
                // 最近3天
                beginDate.subtract(3, 'days');
                beginDate.hour(8);
                beginDate.minute(0);
                beginDate.second(0);
                daterangeHumanize = '最近3日';
                break;
            case 'R4':
                // 近1周
                beginDate.subtract(7, 'days');
                beginDate.hour(8);
                beginDate.minute(0);
                beginDate.second(0);
                daterangeHumanize = '最近一周';
                break;
            case 'R5':
                // 近1月
                beginDate.subtract(1, 'months');
                beginDate.hour(8);
                beginDate.minute(0);
                beginDate.second(0);
                daterangeHumanize = '最近一个月';
                break;
            case 'R6':
                // 近3月
                beginDate.subtract(3, 'months');
                beginDate.hour(8);
                beginDate.minute(0);
                beginDate.second(0);
                daterangeHumanize = '最近3个月';
                break;
        }

        var str1 = beginDate.format(this.options.momentfmt);
        var str2 = endDate.format(this.options.momentfmt);

        this.$wdatePickerBegin.val(str1);
        this.$wdatePickerEnd.val(str2);

        this.$daterangeHumanize.val(daterangeHumanize);
    };

    QuickDateSelector.prototype.updateDateRange = function() {
        var beginDate = this.$wdatePickerBegin.val();
        var endDate = this.$wdatePickerEnd.val();

        this.$daterangeHumanize.val(beginDate + ' 至 ' + endDate);
    };

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this);

            var data = $this.data('bs.quickDateSelector');
            var options = typeof option == 'object' && option;

            if (!data) {
                $this.data('bs.quickDateSelector', (data = new QuickDateSelector(this, options)));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    var old = $.fn.quickDateSelector;

    $.fn.quickDateSelector = Plugin
    $.fn.quickDateSelector.Constructor = QuickDateSelector

    $.fn.quickDateSelector.noConflict = function() {
        $.fn.quickDateSelector = old;
        return this;
    };

    $(document).on('click.bs.quickDateSelector.data-api', '[data-select-to]', function(e) {
        var $ele = $(e.target);
        var toIndex = $ele.attr('data-select-to');
        var quickDateSelector = $ele.closest('.quickDateSelector').data('bs.quickDateSelector');
        quickDateSelector.quickChangDate(toIndex);
    }).on('click.bs.quickDateSelector.data-api', '[data-wdatePicker]', function(e) {
        var $quickDateSelector = $(e.target).closest('.quickDateSelector');
        var options = $.extend({}, QuickDateSelector.DEFAULTS, $quickDateSelector.data());

        return WdatePicker({
            onpicked: function(dp) {
                // var a = dp.cal.getDateStr();
                Plugin.call($quickDateSelector, 'updateDateRange');
            },
            dateFmt: options.datefmt
        });
    });

    $(window).on('load', function() {
        $('[data-toggle="quickDateSelector"]').each(function() {
            var $quickDateSelector = $(this);
            Plugin.call($quickDateSelector, 'init');
        });
    });
})(window.jQuery)