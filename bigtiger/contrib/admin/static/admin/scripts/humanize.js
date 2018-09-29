var humanize = humanize || {};

humanize.formatDate = function(val, row) {
    if (val == null) return '';
    return moment(val).format('YYYY-MM-DD');
};

humanize.formatDateTime = function(val, row) {
    if (val == null) return '';
    return moment(val).format('YYYY-MM-DD HH:mm:ss');
};

humanize.formatYesNo = function(val, row) {
    if (val == 0) {
        return '否';
    } else if (val == 1) {
        return '是';
    }
    return '未知';
};

humanize.formatYesNoImg = function(val, row) {
    if (val == 0) {
        return '<span class="glyphicon glyphicon-remove" style="color:red;" title="否"></span>';
    } else if (val == 1) {
        return '<span class="glyphicon glyphicon-ok" style="color:blue;" title="是"></span>';
    }
    return '<span class="glyphicon glyphicon-question-sign" title="未知"></span>';
};

humanize.formatSex = function(val, row) {
    if (val == 1) {
        return '男';
    } else if (val == 0) {
        return '女';
    } else {
        return '未知';
    }
};

humanize.formatDataStatus = function(val, row) {
    if (val == 0) {
        return '新增';
    }
    return '锁定';
};

humanize.formatTip = function(val, row) {
    var t = _.template('<span title="<%= value %>"><%= value %></span>');
    return t({ 'value': val });
};

humanize.formatDetailInfo = function(val, row) {
    return '<span class="glyphicon glyphicon-info-sign" style="cursor:pointer" title="详情"></span>';
};