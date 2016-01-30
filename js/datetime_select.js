/*!
 * DatetimeSelect v0.0.1
 * Copyright 2015-11-20 Thomas Lau.
 * Licensed under MIT (https://github.com/ThomasLiu/DatetimeSelect.git)
 */


+function ($) {
    'use strict';

    // DatetimeSelect Class definition
    // ===============================

    var DatetimeSelect = function (element, options) {
        this.options = null
        this.$element = null
        this.year = null
        this.month = null
        this.day = null
        this.hour = null
        this.minute = null
        this.$year = null
        this.$month = null
        this.$day = null
        this.$hour = null
        this.$minute = null

        this.init(element, options)

    }

    DatetimeSelect.VERSION = '0.0.1'

    DatetimeSelect.DEFAULTS = {
        current : false,
        maxyear : (new Date()).getFullYear() + 3,
        minyear : (new Date()).getFullYear() - 3,
        required : false,
        type : 'datetimeSelect' // dateSelect ; timeSelect
    }

    DatetimeSelect.OPTIONTEXT = {
        year : '年份',
        month : '月',
        day : '日',
        hour : '时',
        minute : '分'
    }

    DatetimeSelect.getMonthDays = function(year,month){
        var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        if(DatetimeSelect.isLeapYear(year)){
            monthDays[1] = 29
        }
        return monthDays[month - 1]
    }

    DatetimeSelect.getNumStr = function(num){
        return num < 10 ? ('0' + num) : ('' + num)
    }

    DatetimeSelect.format = function(date, format){
        if(date){
            var o = {
                "M+" : date.getMonth()+1, //month
                "d+" : date.getDate(), //day
                "h+" : date.getHours(), //hour
                "m+" : date.getMinutes(), //minute
                "s+" : date.getSeconds(), //second
                "q+" : Math.floor((date.getMonth()+3)/3), //quarter
                "S" : date.getMilliseconds() //millisecond
            }

            if(/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
            }

            for(var k in o) {
                if(new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
                }
            }
            return format;
        } else {
            return ''
        }
    }


    DatetimeSelect.prototype.init = function (element, options) {
        this.$element  = $(element)
        this.type      = this.$element.data('toggle')
        this.options   = this.getOptions(options)

        if (this.$element[0] instanceof document.constructor && !this.options.selector) {
            throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
        }
        if(this.options.current){
            this.$element.val(DatetimeSelect.format(new Date(),'yyyy/MM/dd hh:mm'))
        }

        this.buildSelect()

        this.$element.closest('form').on('submit',function(){
            var $thisForm = $(this)
            var canSubmit = true
            $('.datetime-select',$thisForm).each(function(){
                var $thisSelect = $(this)
                if($thisSelect.val() === '-1'){
                    canSubmit = false
                    $thisSelect.closest('.form-group').removeClass('has-error').addClass('has-error')
                }
            })
            if(!canSubmit){
                return false
            }
        }).on('reset',function(){
            var $thisForm = $(this)
            $('[data-toggle="datetimeSelect"],[data-toggle="timeSelect"],[data-toggle="dateSelect"]',$thisForm).each(function(){
                var $thisInput = $(this)
                $thisInput.data('ls.datetimeSelect').cleanValue()
            })
        });
    }

    DatetimeSelect.prototype.buildSelect = function () {
        var value = this.$element.attr('value') || this.$element.val()
        if(value){
            this.valueDate = new Date(value)
            this.year = this.valueDate.getFullYear()
            this.month = this.valueDate.getMonth() + 1
            this.day = this.valueDate.getDate()
            this.hour = this.valueDate.getHours()
            this.minute = this.valueDate.getMinutes()
        }else {
            this.valueDate = null
            this.year = null
            this.month = null
            this.day = null
            this.hour = null
            this.minute = null
        }
        if(this.type === 'timeSelect'){
            this.initHour()
            if(value){
                this.initMinute()
            }
        }else {
            this.initYear()
            if(value){
                this.initMonth()
                this.initDay()
                if(this.type === 'datetimeSelect') {
                    this.initHour()
                    this.initMinute()
                }
            }
        }
    }

    DatetimeSelect.prototype.getDefaults = function () {
        return DatetimeSelect.DEFAULTS
    }

    DatetimeSelect.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options)
        return options
    }

    DatetimeSelect.prototype.initSelect = function (options, addFunction, callback) {
        var that = this
        var dateModel = options.dateModel
        var oldValue = parseInt(that[dateModel])
        if(that['$' + dateModel]){
            that['$' + dateModel].remove()
            that[dateModel] = null
        }
        that['$' + dateModel] = $('<select>')
        that['$' + dateModel].addClass('datetime-select').addClass('datetime-select-' + dateModel)
        if(that.options.required){
            that['$' + dateModel].attr('required','required')
        }

        var $tipsOption = $('<option value="-1">' + DatetimeSelect.OPTIONTEXT[dateModel] + '</option>')
        that['$' + dateModel].append($tipsOption)

        for(var i = options.start; i > options.end; i-- ){
            var $option = $('<option value="' + i + '">' + i + '</option>')

            if((that.valueDate && i === options.inputValue) || (oldValue && i === oldValue)){
                $option.attr('selected','selected')
                that[dateModel] = i;
            }
            that['$' + dateModel].append($option)
        }
        addFunction()
        that['$' + dateModel].on('change',function(){
            var $this = $(this),
                val = $this.val()
            if(val >= 0){
                that[dateModel] = val
            }else {
                that[dateModel] = null
            }
            that.updateInputVlaue()
            if(callback){
                callback()
            }
        })
        that.updateInputVlaue()
    }

    DatetimeSelect.prototype.initYear = function () {
        var that = this
        that.initSelect({
            dateModel : 'year',
            inputValue : that.valueDate ? that.valueDate.getFullYear() : -1,
            currentValue : (new Date()).getFullYear(),
            start : that.options.maxyear,
            end : that.options.minyear
        },function(){
            that.$element.before(that.$year)
        },function(){
            if(that.year && !that.month){
                that.initMonth()
            }else if(that.year && that.month && parseInt(that.month) === 2){
                that.initDay()
            }
        })
    }

    DatetimeSelect.prototype.initMonth = function () {
        var that = this
        that.initSelect({
            dateModel : 'month',
            inputValue : that.valueDate ? (that.valueDate.getMonth() + 1) : -1,
            currentValue : (new Date()).getMonth() + 1,
            start : 12,
            end : 0
        },function(){
            that.$year.after(that.$month)
        },function(){
            var isReset = false;
            if(that.month && !that.day){
                that.initDay()
                isReset = true
            }else if(that.month && that.day){
                var monthDays = DatetimeSelect.getMonthDays(that.year,that.month)
                if(parseInt(that.$day.data('monthDays')) !== monthDays){
                    that.initDay()
                    isReset = true
                }
            }
        })
    }


    DatetimeSelect.prototype.initDay = function () {
        var that = this
        var monthDays = DatetimeSelect.getMonthDays(that.year,that.month)
        that.initSelect({
            dateModel : 'day',
            inputValue : that.valueDate ? that.valueDate.getDate() : -1,
            currentValue : (new Date()).getDate(),
            start : monthDays,
            end : 0
        },function(){
            that.$month.after(that.$day)
            that.$day.data('monthDays',monthDays)
        },function(){
            if(that.day && !that.hour && that.type === 'datetimeSelect'){
                that.initHour()
            }
        })
    }

    DatetimeSelect.prototype.initHour = function () {
        var that = this
        that.initSelect({
            dateModel : 'hour',
            inputValue : that.valueDate ? that.valueDate.getHours() : -1,
            currentValue : (new Date()).getHours(),
            start : 23,
            end : -1
        },function(){
            if(that.type === 'timeSelect'){
                that.$element.before(that.$hour)
            }else{
                that.$day.after(that.$hour)
            }
        },function(){
            if(that.hour && !that.minute){
                that.initMinute()
            }
        })
    }

    DatetimeSelect.prototype.initMinute = function () {
        var that = this
        that.initSelect({
            dateModel : 'minute',
            inputValue : that.valueDate ? that.valueDate.getMinutes() : -1,
            currentValue : (new Date()).getMinutes(),
            start : 59,
            end : -1
        },function(){
            that.$hour.after(that.$minute)
        })
    }

    DatetimeSelect.isLeapYear = function(year){
        return (year % 4 === 0 || (year % 100 === 0 && year % 400 === 0))
    }

    DatetimeSelect.prototype.updateInputVlaue = function () {
        var that = this
        var type = that.type
        if(!that.hour && (type === 'datetimeSelect' || type === 'timeSelect')){
            that.minute = null
            if(that.$minute) {
                that.$minute.remove()
            }
        }

        if(!that.month && (type === 'datetimeSelect' || type === 'dateSelect')){
            that.day = null
            if(that.$day) {
                that.$day.remove()
            }
        }
        if(!that.year && (type === 'datetimeSelect' || type === 'dateSelect')){
            that.month = null
            if(that.$month) {
                that.$month.remove()
            }
        }

        if(type === 'datetimeSelect' && that.year && that.month && that.day && that.minute && that.hour){
            that.$element.val(that.year + '/' + DatetimeSelect.getNumStr(that.month) + '/' + DatetimeSelect.getNumStr(that.day) + ' ' + DatetimeSelect.getNumStr(that.hour) + ':' + DatetimeSelect.getNumStr(that.minute))
        }else if(type === 'dateSelect' && that.year && that.month && that.day){
            that.$element.val(that.year + '/' + DatetimeSelect.getNumStr(that.month) + '/' + DatetimeSelect.getNumStr(that.day))
        }else if(type === 'timeSelect' && that.minute && that.hour){
            that.$element.val('1970/01/01 ' + DatetimeSelect.getNumStr(that.hour) + ':' + DatetimeSelect.getNumStr(that.minute))
        }else{
            that.$element.val('')
        }
    }

    DatetimeSelect.prototype.cleanValue = function () {
        var that = this
        that.$element.attr('value','')
        that.$element.val('')
        if(that.$year) {
            that.$year.remove()
        }
        if(that.$month) {
            that.$month.remove()
        }
        if(that.$day) {
            that.$day.remove()
        }
        if(that.$hour) {
            that.$hour.remove()
        }
        if(that.$minute) {
            that.$minute.remove()
        }
        that.buildSelect()
    }

    DatetimeSelect.prototype.destroy = function () {
        var that = this
        var type = that.options.type
        if(that.$year) {
            that.$year.remove()
        }
        if(that.$month) {
            that.$month.remove()
        }
        if(that.$day) {
            that.$day.remove()
        }
        if(that.$hour) {
            that.$hour.remove()
        }
        if(that.$minute) {
            that.$minute.remove()
        }
        that.$element.off('.' + type).removeData('ls.' + type)
    }


    // DatetimeSelect Plugin definition
    // ================================

    function Plugin(option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('ls.datetimeSelect')
            var options = typeof option === 'object' && option

            if (!data && /destroy|hide/.test(option)) {
                return
            }
            if (!data) {
                $this.data('ls.datetimeSelect', (data = new DatetimeSelect(this, options)))
            }
            if (typeof option === 'string') {
                data[option]()
            }
        })
    }

    var old = $.fn.datetimeSelect

    $.fn.datetimeSelect             = Plugin
    $.fn.datetimeSelect.Constructor = DatetimeSelect

    // DatetimeSelect no conflict
    // ==========================

    $.fn.datetimeSelect.noConflict = function () {
        $.fn.datetimeSelect = old
        return this
    }

    // DatetimeSelect DATA-API
    // =======================
    $(window).on('load', function () {
        $('[data-toggle="datetimeSelect"],[data-toggle="timeSelect"],[data-toggle="dateSelect"]').each(function () {
            var $this = $(this)
            Plugin.call($this, $this.data())
        })
    })


}(jQuery);
