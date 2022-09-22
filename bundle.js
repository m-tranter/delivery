(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const {Client} = require('contensis-delivery-api');

let config = { 
	rootUrl: 'https://cms-chesheast.cloud.contensis.com/',
	accessToken: 'QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I',
	projectId: 'website',
	language: 'en-GB',
	versionStatus: 'published',
	pageSize: 50
};

async function loadEntries() {
	let client = Client.create(config);
	let res = await client.entries.list({
		contentTypeId: 'testComment',
		pageOptions: { pageIndex: 0, pageSize: 10 },
		orderBy: ['myComment']
	});
	console.log(res.items);
}

loadEntries();

},{"contensis-delivery-api":26}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var HttpClient = /** @class */ (function () {
    function HttpClient(paramsProvider, fetchFn) {
        this.paramsProvider = paramsProvider;
        this.fetchFn = fetchFn;
    }
    HttpClient.prototype.request = function (url, request) {
        if (request === void 0) { request = {}; }
        var params = this.paramsProvider.getParams();
        var isRelativeRequestUrl = !params.rootUrl || params.rootUrl === '/';
        if (!utils_1.isBrowser() && isRelativeRequestUrl) {
            throw new Error('You cannot specify a relative root url if not in a browser context.');
        }
        request.method = request.method || (!!request.body ? 'POST' : 'GET');
        if (!isRelativeRequestUrl) {
            request.mode = 'cors';
        }
        request.headers = request.headers || {};
        var headers = request.headers;
        if (!headers.accessToken && !!params.accessToken) {
            headers.accessToken = params.accessToken;
        }
        if (params.clientType === 'none' && !headers.accessToken) {
            throw new Error("If the property clientType is set to \"" + params.clientType + "\" then the property accessToken must be provided.");
        }
        if (params.clientType === 'client_credentials' && !params.clientDetails) {
            throw new Error("If the property client type is set to \"" + params.clientType + "\" then the property clientDetails must be set to a ClientCredentialsGrant value.");
        }
        if (!!params.defaultHeaders) {
            var keys = Object.keys(params.defaultHeaders);
            keys.forEach(function (key) {
                if (!headers[key] && !!params.defaultHeaders[key]) {
                    headers[key] = params.defaultHeaders[key];
                }
            });
        }
        var requestUrl = isRelativeRequestUrl ? "" + url : "" + params.rootUrl + url;
        return this.fetchFn(requestUrl, request)
            .then(function (response) {
            var responseHandlerFunction = null;
            if (!!params.responseHandler) {
                if (!!params.responseHandler['*']) {
                    responseHandlerFunction = params.responseHandler['*'];
                }
                if (!!params.responseHandler[response.status]) {
                    responseHandlerFunction = params.responseHandler[response.status];
                }
            }
            var responseContext = {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                data: null
            };
            return response
                .text()
                .then(function (text) {
                return !!text && text.length && text.length > 0 ? JSON.parse(text) : {};
            })
                .then(function (result) {
                responseContext.data = result;
                if (response.ok) {
                    if (!!responseHandlerFunction) {
                        responseHandlerFunction(response, responseContext);
                    }
                    return result;
                }
                return !!responseHandlerFunction ?
                    responseHandlerFunction(response, responseContext)
                    : Promise.reject(responseContext);
            }, function (reason) {
                responseContext.data = reason;
                return !!responseHandlerFunction ?
                    responseHandlerFunction(response, responseContext)
                    : Promise.reject(responseContext);
            });
        })
            .then(function (result) { return result; });
    };
    return HttpClient;
}());
exports.HttpClient = HttpClient;

},{"../utils":20}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./http-client"), exports);
tslib_1.__exportStar(require("./url-builder"), exports);

},{"./http-client":2,"./url-builder":4,"tslib":32}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
var UrlBuilder = /** @class */ (function () {
    function UrlBuilder(url, query) {
        this.url = url;
        this.query = query;
        this.paramMatcher = /(:\b\D\w*)/g;
        this.options = {};
        this.mappers = {};
    }
    UrlBuilder.create = function (url, query) {
        if (query === void 0) { query = null; }
        return new UrlBuilder(url, query);
    };
    UrlBuilder.prototype.addOptions = function (options, defaultParamName) {
        if (defaultParamName === void 0) { defaultParamName = null; }
        if (utils_1.isString(options) && !!defaultParamName) {
            this.options[defaultParamName] = options;
        }
        else {
            this.options = tslib_1.__assign({}, this.options, options);
        }
        return this;
    };
    UrlBuilder.prototype.setParams = function (clientParams) {
        this.clientParams = clientParams;
        return this;
    };
    UrlBuilder.prototype.addMappers = function (mappers) {
        var _this = this;
        if (mappers) {
            Object.keys(mappers).forEach(function (key) {
                _this.mappers[key] = mappers[key];
            });
        }
        return this;
    };
    UrlBuilder.prototype.toUrl = function () {
        var _this = this;
        var namedParams = {};
        var urlTemplate = typeof this.url === 'function' ? this.url(this.options, this.clientParams) : this.url;
        var paramNames = urlTemplate.match(this.paramMatcher);
        if (paramNames) {
            paramNames.forEach(function (paramName) {
                var key = paramName.substring(1);
                var value = null;
                if (utils_1.hasProp(_this.options, key)
                    && _this.options[key] !== null) {
                    value = _this.options[key];
                }
                else if (utils_1.hasProp(_this.clientParams, key)
                    && _this.clientParams[key] !== null) {
                    value = _this.clientParams[key];
                }
                var mapperValue = null;
                if (_this.mappers[paramName]) {
                    mapperValue = _this.mappers[paramName](value, _this.options, _this.clientParams);
                }
                namedParams[paramName] = mapperValue !== null ? mapperValue : value;
            });
        }
        var query = {};
        if (this.query) {
            query = tslib_1.__assign({}, this.query);
            Object.keys(this.query).forEach(function (paramName) {
                var value = query[paramName];
                if (utils_1.hasProp(_this.options, paramName)
                    && _this.options[paramName] !== null) {
                    value = _this.options[paramName];
                }
                else if (utils_1.hasProp(_this.clientParams, paramName)
                    && _this.clientParams[paramName] !== null) {
                    value = _this.clientParams[paramName];
                }
                query[paramName] = _this.mappers[paramName] ?
                    _this.mappers[paramName](value, _this.options, _this.clientParams) : value;
            });
        }
        var url = Object.keys(namedParams)
            .reduce(function (url, key) { return url.replace(key, namedParams[key]); }, urlTemplate);
        var queryString = utils_1.toQuery(query);
        return "" + url + queryString;
    };
    return UrlBuilder;
}());
exports.UrlBuilder = UrlBuilder;

},{"../utils":20,"tslib":32}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./http"), exports);
tslib_1.__exportStar(require("./models"), exports);
tslib_1.__exportStar(require("./utils"), exports);

},{"./http":3,"./models":7,"./utils":20,"tslib":32}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ContensisApplicationError = /** @class */ (function (_super) {
    tslib_1.__extends(ContensisApplicationError, _super);
    function ContensisApplicationError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.name = 'ContensisApplicationError';
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return ContensisApplicationError;
}(Error));
exports.ContensisApplicationError = ContensisApplicationError;
var ContensisAuthenticationError = /** @class */ (function (_super) {
    tslib_1.__extends(ContensisAuthenticationError, _super);
    function ContensisAuthenticationError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.name = 'ContensisAuthenticationError';
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return ContensisAuthenticationError;
}(Error));
exports.ContensisAuthenticationError = ContensisAuthenticationError;

},{"tslib":32}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./errors"), exports);
tslib_1.__exportStar(require("./search"), exports);

},{"./errors":6,"./search":19,"tslib":32}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionValueTypeEnum = {
    Single: 'single',
    Array: 'array',
    Unknown: 'unknown'
};

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeTextSearchOperatorTypeEnum = {
    And: 'and',
    Or: 'or'
};

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Operators_1 = require("./Operators");
var QueryTypes_1 = require("./QueryTypes");
var ManagementQuery = /** @class */ (function () {
    function ManagementQuery() {
        var whereExpressions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            whereExpressions[_i] = arguments[_i];
        }
        this.where = new Operators_1.WhereExpression();
        this.orderBy = [];
        this.pageIndex = 0;
        this.pageSize = 20;
        this.includeArchived = false;
        this.includeDeleted = false;
        if (whereExpressions) {
            this.where.addRange(whereExpressions);
        }
    }
    ManagementQuery.prototype.toJSON = function () {
        var result = {};
        result.pageIndex = this.pageIndex;
        result.pageSize = this.pageSize;
        var orderByDtos = QueryTypes_1.serializeOrder(this.orderBy);
        if (orderByDtos && orderByDtos.length > 0) {
            result.orderBy = orderByDtos;
        }
        result.where = this.where;
        result.includeArchived = this.includeArchived;
        result.includeDeleted = this.includeDeleted;
        return result;
    };
    return ManagementQuery;
}());
exports.ManagementQuery = ManagementQuery;

},{"./Operators":13,"./QueryTypes":17}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ManagementZenqlQuery = /** @class */ (function () {
    function ManagementZenqlQuery(zenql) {
        this.zenql = '';
        this.pageIndex = 0;
        this.pageSize = 20;
        this.includeArchived = false;
        this.includeDeleted = false;
        this.zenql = zenql;
    }
    ManagementZenqlQuery.prototype.toJSON = function () {
        var result = {};
        result.pageIndex = this.pageIndex;
        result.pageSize = this.pageSize;
        result.zenql = this.zenql;
        result.includeArchived = this.includeArchived;
        result.includeDeleted = this.includeDeleted;
        return result;
    };
    return ManagementZenqlQuery;
}());
exports.ManagementZenqlQuery = ManagementZenqlQuery;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorTypeEnum = {
    And: 'and',
    Between: 'between',
    Contains: 'contains',
    EndsWith: 'endsWith',
    EqualTo: 'equalTo',
    Exists: 'exists',
    FreeText: 'freeText',
    GreaterThan: 'greaterThan',
    GreaterThanOrEqualTo: 'greaterThanOrEqualTo',
    In: 'in',
    LessThan: 'lessThan',
    LessThanOrEqualTo: 'lessThanOrEqualTo',
    Not: 'not',
    Or: 'or',
    StartsWith: 'startsWith',
    Where: 'where',
    DistanceWithin: 'distanceWithin'
};

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var __1 = require("..");
var FreeTextSearchOperatorType_1 = require("./FreeTextSearchOperatorType");
var ExpressionBase = /** @class */ (function () {
    function ExpressionBase(fieldName, values, operatorName, valueType) {
        if (values === void 0) { values = []; }
        this.fieldName = fieldName;
        this.values = values;
        this.operatorName = operatorName;
        this.valueType = valueType;
        this._weight = 0;
    }
    ExpressionBase.prototype.addValue = function (value) {
        this.values[this.values.length] = value;
        return this;
    };
    ExpressionBase.prototype.weight = function (weight) {
        this._weight = weight;
        return this;
    };
    ExpressionBase.prototype.toJSON = function () {
        var result = {};
        if (this.fieldName) {
            result.field = this.fieldName;
        }
        if (this.valueType === __1.ExpressionValueTypeEnum.Single) {
            result[this.operatorName] = this.values[0];
        }
        else if (this.valueType === __1.ExpressionValueTypeEnum.Array) {
            result[this.operatorName] = this.values;
        }
        else if (this.values && (this.values.length === 1)) {
            result[this.operatorName] = this.values[0];
        }
        else {
            result[this.operatorName] = this.values;
        }
        if (this._weight && (this._weight > 1)) {
            result.weight = this._weight;
        }
        return result;
    };
    return ExpressionBase;
}());
exports.ExpressionBase = ExpressionBase;
var LogicalExpression = /** @class */ (function (_super) {
    tslib_1.__extends(LogicalExpression, _super);
    function LogicalExpression(values, operatorName, valueType) {
        if (values === void 0) { values = []; }
        return _super.call(this, null, values, operatorName, __1.ExpressionValueTypeEnum.Array) || this;
    }
    LogicalExpression.prototype.getItem = function (index) {
        return this.values[index];
    };
    LogicalExpression.prototype.setItem = function (index, item) {
        this.values[index] = item;
        return this;
    };
    LogicalExpression.prototype.add = function (item) {
        this.values[this.values.length] = item;
        return this;
    };
    LogicalExpression.prototype.addRange = function (items) {
        Array.prototype.push.apply(this.values, items);
        return this;
    };
    LogicalExpression.prototype.indexOf = function (item) {
        return this.values.indexOf(item);
    };
    LogicalExpression.prototype.insert = function (index, item) {
        this.values.splice(index, 0, item);
        return this;
    };
    LogicalExpression.prototype.remove = function (item) {
        var index = this.indexOf(item);
        if (index >= 0) {
            this.removeAt(index);
            return true;
        }
        return false;
    };
    LogicalExpression.prototype.removeAt = function (index) {
        this.values.splice(index, 1);
        return this;
    };
    LogicalExpression.prototype.clear = function () {
        this.values.length = 0;
        return this;
    };
    LogicalExpression.prototype.contains = function (item) {
        return (this.indexOf(item) >= 0);
    };
    LogicalExpression.prototype.count = function () {
        return this.values.length;
    };
    return LogicalExpression;
}(ExpressionBase));
exports.LogicalExpression = LogicalExpression;
var AndExpression = /** @class */ (function (_super) {
    tslib_1.__extends(AndExpression, _super);
    function AndExpression(values) {
        return _super.call(this, values, __1.OperatorTypeEnum.And, __1.ExpressionValueTypeEnum.Array) || this;
    }
    return AndExpression;
}(LogicalExpression));
var BetweenExpression = /** @class */ (function (_super) {
    tslib_1.__extends(BetweenExpression, _super);
    function BetweenExpression(fieldName, minimum, maximum) {
        return _super.call(this, fieldName, [minimum, maximum], __1.OperatorTypeEnum.Between, __1.ExpressionValueTypeEnum.Array) || this;
    }
    return BetweenExpression;
}(ExpressionBase));
var ContainsExpression = /** @class */ (function (_super) {
    tslib_1.__extends(ContainsExpression, _super);
    function ContainsExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.Contains, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return ContainsExpression;
}(ExpressionBase));
var DistanceWithinExpression = /** @class */ (function (_super) {
    tslib_1.__extends(DistanceWithinExpression, _super);
    function DistanceWithinExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.DistanceWithin, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return DistanceWithinExpression;
}(ExpressionBase));
var EndsWithExpression = /** @class */ (function (_super) {
    tslib_1.__extends(EndsWithExpression, _super);
    function EndsWithExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.EndsWith, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return EndsWithExpression;
}(ExpressionBase));
var EqualToExpression = /** @class */ (function (_super) {
    tslib_1.__extends(EqualToExpression, _super);
    function EqualToExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.EqualTo, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return EqualToExpression;
}(ExpressionBase));
var ExistsExpression = /** @class */ (function (_super) {
    tslib_1.__extends(ExistsExpression, _super);
    function ExistsExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.Exists, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return ExistsExpression;
}(ExpressionBase));
var FreeTextExpression = /** @class */ (function (_super) {
    tslib_1.__extends(FreeTextExpression, _super);
    function FreeTextExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.FreeText, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return FreeTextExpression;
}(ExpressionBase));
var GreaterThanExpression = /** @class */ (function (_super) {
    tslib_1.__extends(GreaterThanExpression, _super);
    function GreaterThanExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.GreaterThan, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return GreaterThanExpression;
}(ExpressionBase));
var GreaterThanOrEqualToExpression = /** @class */ (function (_super) {
    tslib_1.__extends(GreaterThanOrEqualToExpression, _super);
    function GreaterThanOrEqualToExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.GreaterThanOrEqualTo, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return GreaterThanOrEqualToExpression;
}(ExpressionBase));
var InExpression = /** @class */ (function (_super) {
    tslib_1.__extends(InExpression, _super);
    function InExpression(fieldName, values) {
        return _super.call(this, fieldName, values, __1.OperatorTypeEnum.In, __1.ExpressionValueTypeEnum.Array) || this;
    }
    return InExpression;
}(ExpressionBase));
var LessThanExpression = /** @class */ (function (_super) {
    tslib_1.__extends(LessThanExpression, _super);
    function LessThanExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.LessThan, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return LessThanExpression;
}(ExpressionBase));
var LessThanOrEqualToExpression = /** @class */ (function (_super) {
    tslib_1.__extends(LessThanOrEqualToExpression, _super);
    function LessThanOrEqualToExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.LessThanOrEqualTo, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return LessThanOrEqualToExpression;
}(ExpressionBase));
var NotExpression = /** @class */ (function (_super) {
    tslib_1.__extends(NotExpression, _super);
    function NotExpression(value) {
        return _super.call(this, [value], __1.OperatorTypeEnum.Not, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return NotExpression;
}(LogicalExpression));
var OrExpression = /** @class */ (function (_super) {
    tslib_1.__extends(OrExpression, _super);
    function OrExpression(values) {
        return _super.call(this, values, __1.OperatorTypeEnum.Or, __1.ExpressionValueTypeEnum.Array) || this;
    }
    return OrExpression;
}(LogicalExpression));
var StartsWithExpression = /** @class */ (function (_super) {
    tslib_1.__extends(StartsWithExpression, _super);
    function StartsWithExpression(fieldName, value) {
        return _super.call(this, fieldName, [value], __1.OperatorTypeEnum.StartsWith, __1.ExpressionValueTypeEnum.Single) || this;
    }
    return StartsWithExpression;
}(ExpressionBase));
var WhereExpression = /** @class */ (function (_super) {
    tslib_1.__extends(WhereExpression, _super);
    function WhereExpression(values) {
        if (values === void 0) { values = []; }
        return _super.call(this, values, __1.OperatorTypeEnum.Where, __1.ExpressionValueTypeEnum.Array) || this;
    }
    WhereExpression.prototype.toJSON = function () {
        var result = _super.prototype.toJSON.call(this);
        return result[__1.OperatorTypeEnum.Where];
    };
    return WhereExpression;
}(LogicalExpression));
exports.WhereExpression = WhereExpression;
var Operators = /** @class */ (function () {
    function Operators() {
    }
    Operators.prototype.and = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return new AndExpression(values);
    };
    Operators.prototype.between = function (name, minimum, maximum) {
        return new BetweenExpression(name, minimum, maximum);
    };
    Operators.prototype.contains = function (name, value) {
        return new ContainsExpression(name, value);
    };
    Operators.prototype.distanceWithin = function (name, lat, lon, distance) {
        return new DistanceWithinExpression(name, { lat: lat, lon: lon, distance: distance });
    };
    Operators.prototype.endsWith = function (name, value) {
        return new EndsWithExpression(name, value);
    };
    Operators.prototype.equalTo = function (name, value) {
        return new EqualToExpression(name, value);
    };
    Operators.prototype.exists = function (name, value) {
        return new ExistsExpression(name, value);
    };
    Operators.prototype.freeText = function (name, term, fuzzy, operator) {
        if (fuzzy === void 0) { fuzzy = false; }
        if (operator === void 0) { operator = FreeTextSearchOperatorType_1.FreeTextSearchOperatorTypeEnum.And; }
        return new FreeTextExpression(name, { term: term, fuzzy: fuzzy, operator: operator });
    };
    Operators.prototype.greaterThan = function (name, value) {
        return new GreaterThanExpression(name, value);
    };
    Operators.prototype.greaterThanOrEqualTo = function (name, value) {
        return new GreaterThanOrEqualToExpression(name, value);
    };
    Operators.prototype.in = function (name) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        return new InExpression(name, values);
    };
    Operators.prototype.lessThan = function (name, value) {
        return new LessThanExpression(name, value);
    };
    Operators.prototype.lessThanOrEqualTo = function (name, value) {
        return new LessThanOrEqualToExpression(name, value);
    };
    Operators.prototype.not = function (expression) {
        return new NotExpression(expression);
    };
    Operators.prototype.or = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return new OrExpression(values);
    };
    Operators.prototype.startsWith = function (name, value) {
        return new StartsWithExpression(name, value);
    };
    return Operators;
}());
exports.Operators = Operators;

},{"..":7,"./FreeTextSearchOperatorType":9,"tslib":32}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ordering_1 = require("./Ordering");
var OrderByFactory = /** @class */ (function () {
    function OrderByFactory() {
    }
    OrderByFactory.prototype.asc = function (fieldName) {
        return (new Ordering_1.Ordering()).asc(fieldName);
    };
    OrderByFactory.prototype.desc = function (fieldName) {
        return (new Ordering_1.Ordering()).desc(fieldName);
    };
    return OrderByFactory;
}());
exports.OrderByFactory = OrderByFactory;

},{"./Ordering":15}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ordering = /** @class */ (function () {
    function Ordering() {
        this._items = [];
    }
    Ordering.prototype.asc = function (fieldName) {
        this._items.push({ 'asc': fieldName });
        return this;
    };
    Ordering.prototype.desc = function (fieldName) {
        this._items.push({ 'desc': fieldName });
        return this;
    };
    Ordering.prototype.toArray = function () {
        return this._items;
    };
    return Ordering;
}());
exports.Ordering = Ordering;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Operators_1 = require("./Operators");
var QueryTypes_1 = require("./QueryTypes");
var Query = /** @class */ (function () {
    function Query() {
        var whereExpressions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            whereExpressions[_i] = arguments[_i];
        }
        this.where = new Operators_1.WhereExpression();
        this.orderBy = [];
        this.pageIndex = 0;
        this.pageSize = 20;
        this.fields = [];
        if (whereExpressions) {
            this.where.addRange(whereExpressions);
        }
    }
    Query.prototype.toJSON = function () {
        var result = {};
        result.pageIndex = this.pageIndex;
        result.pageSize = this.pageSize;
        var orderByDtos = QueryTypes_1.serializeOrder(this.orderBy);
        if (orderByDtos && orderByDtos.length > 0) {
            result.orderBy = orderByDtos;
        }
        result.where = this.where;
        if (this.fields && this.fields.length > 0) {
            result.fields = this.fields;
        }
        return result;
    };
    return Query;
}());
exports.Query = Query;

},{"./Operators":13,"./QueryTypes":17}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Operators_1 = require("./Operators");
var OrderByFactory_1 = require("./OrderByFactory");
var Ordering_1 = require("./Ordering");
exports.Op = new Operators_1.Operators();
exports.OrderBy = new OrderByFactory_1.OrderByFactory();
function toOrderByDto(value) {
    var _a;
    if (!value) {
        return null;
    }
    if (typeof value === 'string') {
        var firstChar = value.substring(0, 1);
        if (firstChar === '+' || firstChar === '-') {
            var direction = (firstChar === '-') ? 'desc' : 'asc';
            return _a = {}, _a[direction] = value.substring(1), _a;
        }
        return { 'asc': value };
    }
    return value;
}
function serializeOrder(orderBy) {
    if (!orderBy) {
        return [];
    }
    if (typeof orderBy === 'string') {
        var o = toOrderByDto(orderBy);
        return !!o ? [o] : [];
    }
    if (Array.isArray(orderBy)) {
        return orderBy.map(toOrderByDto).filter(function (o) { return !!o; });
    }
    var orderByAsOrdering = orderBy instanceof Ordering_1.Ordering ? orderBy : null;
    if (orderByAsOrdering === null) {
        return [];
    }
    return orderByAsOrdering.toArray();
}
exports.serializeOrder = serializeOrder;

},{"./Operators":13,"./OrderByFactory":14,"./Ordering":15}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ZenqlQuery = /** @class */ (function () {
    function ZenqlQuery(zenql) {
        this.zenql = '';
        this.pageIndex = 0;
        this.pageSize = 20;
        this.fields = [];
        this.zenql = zenql;
    }
    ZenqlQuery.prototype.toJSON = function () {
        var result = {};
        result.pageIndex = this.pageIndex;
        result.pageSize = this.pageSize;
        result.zenql = this.zenql;
        if (this.fields && this.fields.length > 0) {
            result.fields = this.fields;
        }
        return result;
    };
    return ZenqlQuery;
}());
exports.ZenqlQuery = ZenqlQuery;

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./ExpressionValueType"), exports);
tslib_1.__exportStar(require("./FreeTextSearchOperatorType"), exports);
tslib_1.__exportStar(require("./ManagementQuery"), exports);
tslib_1.__exportStar(require("./ManagementZenqlQuery"), exports);
tslib_1.__exportStar(require("./Operators"), exports);
tslib_1.__exportStar(require("./OperatorType"), exports);
tslib_1.__exportStar(require("./Query"), exports);
tslib_1.__exportStar(require("./QueryTypes"), exports);
tslib_1.__exportStar(require("./ZenqlQuery"), exports);

},{"./ExpressionValueType":8,"./FreeTextSearchOperatorType":9,"./ManagementQuery":10,"./ManagementZenqlQuery":11,"./OperatorType":12,"./Operators":13,"./Query":16,"./QueryTypes":17,"./ZenqlQuery":18,"tslib":32}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isNode = require("detect-node");
function hasProp(o, key) {
    return !!o && typeof o[key] !== 'undefined';
}
exports.hasProp = hasProp;
function toQuery(values, dontSort) {
    if (dontSort === void 0) { dontSort = false; }
    var keys = Object
        .keys(values)
        .filter(function (key) {
        return key && (values[key] !== null)
            && (values[key] !== '')
            && (Array.isArray(values[key]) ? values[key].length > 0 : true);
    });
    if (!dontSort) {
        keys.sort(); // sort keys for easier testing
    }
    var query = keys
        .map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(values[key]); });
    return (query.length > 0)
        ? '?' + query.join('&')
        : '';
}
exports.toQuery = toQuery;
function isString(obj) {
    return typeof obj === 'string' || obj instanceof String;
}
exports.isString = isString;
/** Checks if the runtime context is a browser */
function isBrowser() {
    return typeof window !== 'undefined';
}
exports.isBrowser = isBrowser;
/**
 * Checks if the current browser is IE.
 *
 * Support: IE 9-11 only
 * documentMode is an IE-only property
 * http://msdn.microsoft.com/en-us/library/ie/cc196988(v=vs.85).aspx
 */
function isIE() {
    var msie; // holds major version number for IE, or NaN if UA is not IE.
    msie = (window && window.document && window.document.documentMode) ? window.document.documentMode : null;
    return !!msie && msie <= 11;
}
exports.isIE = isIE;
/** Checks if the runtime context is Node.js */
function isNodejs() {
    return isNode;
}
exports.isNodejs = isNodejs;
exports.defaultMapperForLanguage = function (value, options, params) {
    return !value && !!params ? params.language : value;
};
exports.defaultMapperForPublishedVersionStatus = function (value, options, params) {
    return (value === 'published') ? null : value;
};
exports.defaultMapperForLatestVersionStatus = function (value, options, params) {
    return (value === 'latest') ? null : value;
};

},{"detect-node":31}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClientConfig {
    constructor(currentConfig, previousConfig) {
        this.currentConfig = currentConfig;
        this.previousConfig = previousConfig;
        this.rootUrl = null;
        this.accessToken = null;
        this.defaultHeaders = null;
        this.projectId = null;
        this.language = null;
        this.versionStatus = 'published';
        this.pageSize = 25;
        this.responseHandler = null;
        this.fetchFn = null;
        this.rootUrl = this.getValue((c) => c.rootUrl);
        this.accessToken = this.getValue((c) => c.accessToken);
        this.defaultHeaders = this.getValue((c) => c.defaultHeaders);
        this.projectId = this.getValue((c) => c.projectId);
        this.language = this.getValue((c) => c.language);
        this.versionStatus = this.getValue((c) => c.versionStatus);
        this.pageSize = this.getValue((c) => c.pageSize);
        this.responseHandler = this.getValue((c) => c.responseHandler);
        this.fetchFn = this.getValue((c) => c.fetchFn);
        while (this.rootUrl && this.rootUrl.substr(this.rootUrl.length - 1, 1) === '/') {
            this.rootUrl = this.rootUrl.substr(0, this.rootUrl.length - 1);
        }
    }
    toParams() {
        return {
            rootUrl: this.rootUrl,
            accessToken: this.accessToken,
            defaultHeaders: this.defaultHeaders,
            language: this.language,
            versionStatus: this.versionStatus,
            projectId: this.projectId,
            pageIndex: 0,
            pageSize: this.pageSize,
            responseHandler: this.responseHandler
        };
    }
    getValue(getter) {
        let result = null;
        if (this.currentConfig) {
            result = getter(this.currentConfig);
        }
        if (this.previousConfig && !result) {
            result = getter(this.previousConfig);
        }
        return result || getter(this);
    }
}
exports.ClientConfig = ClientConfig;

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entry_operations_1 = require("../entries/entry-operations");
const content_type_operations_1 = require("../content-types/content-type-operations");
const project_operations_1 = require("../projects/project-operations");
const taxonomy_operations_1 = require("../taxonomy/taxonomy-operations");
const client_config_1 = require("./client-config");
const node_operations_1 = require("../nodes/node-operations");
const contensis_core_api_1 = require("contensis-core-api");
const cross_fetch_1 = require("cross-fetch");
class Client {
    constructor(config = null) {
        this.clientConfig = null;
        this.clientConfig = new client_config_1.ClientConfig(config, Client.defaultClientConfig);
        this.fetchFn = !this.clientConfig.fetchFn ? cross_fetch_1.default : this.clientConfig.fetchFn;
        this.httpClient = new contensis_core_api_1.HttpClient(this, this.fetchFn);
        this.entries = new entry_operations_1.EntryOperations(this.httpClient, this);
        this.project = new project_operations_1.ProjectOperations(this.httpClient, this);
        this.contentTypes = new content_type_operations_1.ContentTypeOperations(this.httpClient, this);
        this.nodes = new node_operations_1.NodeOperations(this.httpClient, this);
        this.taxonomy = new taxonomy_operations_1.TaxonomyOperations(this.httpClient, this);
    }
    static create(config = null) {
        return new Client(config);
    }
    static configure(config) {
        Client.defaultClientConfig = new client_config_1.ClientConfig(config, Client.defaultClientConfig);
    }
    getParams() {
        return this.clientConfig.toParams();
    }
}
Client.defaultClientConfig = null;
exports.Client = Client;

},{"../content-types/content-type-operations":23,"../entries/entry-operations":24,"../nodes/node-operations":27,"../projects/project-operations":28,"../taxonomy/taxonomy-operations":29,"./client-config":21,"contensis-core-api":5,"cross-fetch":30}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contensis_core_api_1 = require("contensis-core-api");
class ContentTypeOperations {
    constructor(httpClient, paramsProvider) {
        this.httpClient = httpClient;
        this.paramsProvider = paramsProvider;
    }
    get(contentTypeId) {
        let url = contensis_core_api_1.UrlBuilder.create('/api/delivery/projects/:projectId/contentTypes/:contentTypeId')
            .addOptions(contentTypeId, 'contentTypeId')
            .setParams(this.paramsProvider.getParams())
            .toUrl();
        return this.httpClient.request(url);
    }
}
exports.ContentTypeOperations = ContentTypeOperations;

},{"contensis-core-api":5}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const link_resolver_1 = require("./link-resolver");
const contensis_core_api_1 = require("contensis-core-api");
const defaultListUrl = `/api/delivery/projects/:projectId/entries`;
let listUrl = (options, params) => {
    return !!options.contentTypeId
        ? `/api/delivery/projects/:projectId/contentTypes/:contentTypeId/entries`
        : defaultListUrl;
};
let getMappers = {
    language: contensis_core_api_1.defaultMapperForLanguage,
    versionStatus: contensis_core_api_1.defaultMapperForPublishedVersionStatus,
    fields: (value) => (value && value.length > 0) ? value : null,
    linkDepth: (value) => (value && (value > 0)) ? value : null,
};
let listMappers = Object.assign({}, getMappers, { order: (value) => (value && value.length > 0) ? value : null, pageIndex: (value, options, params) => (options && options.pageOptions && options.pageOptions.pageIndex) || (params.pageIndex), pageSize: (value, options, params) => (options && options.pageOptions && options.pageOptions.pageSize) || (params.pageSize) });
let searchMappers = {
    linkDepth: (value) => (value && (value > 0)) ? value : null
};
class EntryOperations {
    constructor(httpClient, paramsProvider) {
        this.httpClient = httpClient;
        this.paramsProvider = paramsProvider;
    }
    get(idOrOptions) {
        let url = contensis_core_api_1.UrlBuilder.create('/api/delivery/projects/:projectId/entries/:id', { language: null, versionStatus: null, linkDepth: null, fields: null })
            .addOptions(idOrOptions, 'id')
            .setParams(this.paramsProvider.getParams())
            .addMappers(getMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    list(contentTypeIdOrOptions) {
        let url = contensis_core_api_1.UrlBuilder.create(listUrl, { language: null, versionStatus: null, linkDepth: null, order: null, fields: null, pageIndex: null, pageSize: null })
            .addOptions(contentTypeIdOrOptions, 'contentTypeId')
            .setParams(this.paramsProvider.getParams())
            .addMappers(listMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    search(query, linkDepth = 0) {
        if (!query) {
            return new Promise((resolve) => { resolve(null); });
        }
        let deliveryQuery = query instanceof contensis_core_api_1.Query ? query : null;
        // use duck-typing for backwards compatibility pre v1.2.0
        if (deliveryQuery !== null || !!query.where || !!query.orderBy) {
            return this.searchUsingQuery(deliveryQuery || query, linkDepth);
        }
        let zenqlQuery = query instanceof contensis_core_api_1.ZenqlQuery ? query : null;
        if (zenqlQuery === null) {
            if (typeof query === 'string') {
                zenqlQuery = new contensis_core_api_1.ZenqlQuery(query);
            }
            else {
                throw new Error('A valid query needs to be specified.');
            }
        }
        let params = this.paramsProvider.getParams();
        let pageSize = params.pageSize || 25;
        let pageIndex = params.pageIndex || 0;
        let fields = [];
        pageSize = zenqlQuery.pageSize || pageSize;
        pageIndex = zenqlQuery.pageIndex || pageIndex;
        fields = zenqlQuery.fields || fields;
        let { accessToken, projectId, language, responseHandler, rootUrl, versionStatus } = params, requestParams = tslib_1.__rest(params, ["accessToken", "projectId", "language", "responseHandler", "rootUrl", "versionStatus"]);
        let payload = Object.assign({}, requestParams, { linkDepth,
            pageSize,
            pageIndex, zenql: zenqlQuery.zenql });
        if (fields && fields.length > 0) {
            payload['fields'] = fields;
        }
        let url = contensis_core_api_1.UrlBuilder.create(defaultListUrl, Object.assign({}, payload))
            .setParams(Object.assign({}, payload, { projectId }))
            .addMappers(searchMappers)
            .toUrl();
        return this.httpClient.request(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
    }
    resolve(entryOrList, fields = null) {
        let params = this.paramsProvider.getParams();
        let resolver = new link_resolver_1.LinkResolver(entryOrList, fields, params.versionStatus, (query) => this.search(query));
        return resolver.resolve();
    }
    searchUsingQuery(query, linkDepth = 0) {
        if (!query) {
            return new Promise((resolve) => { resolve(null); });
        }
        let deliveryQuery = query;
        let params = this.paramsProvider.getParams();
        let pageSize = params.pageSize || 25;
        let pageIndex = params.pageIndex || 0;
        let fields = [];
        pageSize = deliveryQuery.pageSize || pageSize;
        pageIndex = deliveryQuery.pageIndex || pageIndex;
        fields = deliveryQuery.fields || fields;
        let orderBy = (deliveryQuery.orderBy && (deliveryQuery.orderBy._items || deliveryQuery.orderBy));
        let { accessToken, projectId, language, responseHandler, rootUrl, versionStatus } = params, requestParams = tslib_1.__rest(params, ["accessToken", "projectId", "language", "responseHandler", "rootUrl", "versionStatus"]);
        let payload = Object.assign({}, requestParams, { linkDepth,
            pageSize,
            pageIndex, where: JSON.stringify(deliveryQuery.where) });
        if (fields && fields.length > 0) {
            payload['fields'] = fields;
        }
        if (deliveryQuery.orderBy && (!Array.isArray(deliveryQuery.orderBy) || deliveryQuery.orderBy.length > 0)) {
            payload['orderBy'] = JSON.stringify(orderBy);
        }
        let url = contensis_core_api_1.UrlBuilder.create('/api/delivery/projects/:projectId/entries/search', Object.assign({}, payload))
            .setParams(Object.assign({}, payload, { projectId }))
            .addMappers(searchMappers)
            .toUrl();
        if (contensis_core_api_1.isBrowser() && contensis_core_api_1.isIE() && url.length > 2083) {
            return this.searchUsingPost(query, linkDepth);
        }
        return this.httpClient.request(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
    }
    searchUsingPost(query, linkDepth = 0) {
        if (!query) {
            return new Promise((resolve) => { resolve(null); });
        }
        let params = this.paramsProvider.getParams();
        query.pageSize = query.pageSize || params.pageSize;
        query.pageIndex = query.pageIndex || 0;
        let url = contensis_core_api_1.UrlBuilder.create('/api/delivery/projects/:projectId/entries/search', { linkDepth })
            .setParams(this.paramsProvider.getParams())
            .addMappers(searchMappers)
            .toUrl();
        return this.httpClient.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(query)
        });
    }
}
exports.EntryOperations = EntryOperations;

},{"./link-resolver":25,"contensis-core-api":5,"tslib":32}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contensis_core_api_1 = require("contensis-core-api");
function isUnresolvedEntry(value) {
    if (value && value.sys && value.sys.id) {
        let keys = Object.keys(value);
        return (keys.length === 1);
    }
    return false;
}
function isUnresolvedImage(value) {
    if (value && value.asset) {
        let keys = Object.keys(value);
        return (keys.length <= 2) && isUnresolvedEntry(value.asset);
    }
    return false;
}
function isComposer(value) {
    if (Array.isArray(value) && (value.length > 0)) {
        return isComposerItem(value[0]);
    }
    return false;
}
function isComposerItem(value) {
    if (value && value.type && value.value) {
        let keys = Object.keys(value);
        return (keys.length === 2);
    }
    return false;
}
class DeferredEntry {
    constructor(sys, versionStatus) {
        this.sys = sys;
        this.versionStatus = versionStatus;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.expression = contensis_core_api_1.Op.and(contensis_core_api_1.Op.equalTo('sys.id', sys.id), contensis_core_api_1.Op.equalTo('sys.language', sys.language), contensis_core_api_1.Op.equalTo('sys.versionStatus', this.versionStatus));
    }
    is(sys) {
        return !!(sys && sys.id && sys.language && (sys.id === this.sys.id) && (sys.language === this.sys.language));
    }
}
class ListResolver {
    constructor(entries, paths, versionStatus, search) {
        this.entries = entries;
        this.paths = paths;
        this.versionStatus = versionStatus;
        this.search = search;
        this.deferredEntries = [];
    }
    resolve() {
        this.deferredEntries = [];
        let promises = this.entries.map(entry => {
            let resolver = new EntryResolver(entry, this.paths, (id, language) => this.getEntry(id, language));
            return resolver.resolve();
        });
        this.nestedSearch();
        return Promise.all(promises).then(values => this.entries);
    }
    getEntry(id, language) {
        let deferredEntry = new DeferredEntry({ id, language }, this.versionStatus);
        this.deferredEntries.push(deferredEntry);
        return deferredEntry.promise;
    }
    nestedSearch() {
        let expressions = this.deferredEntries.map(g => g.expression);
        let query = new contensis_core_api_1.Query(contensis_core_api_1.Op.or(...expressions));
        query.pageIndex = 0;
        query.pageSize = expressions.length;
        return this.search(query).then((list) => {
            let allDeferredEntries = this.deferredEntries;
            this.deferredEntries = [];
            let promises = [];
            for (let item of list.items) {
                let deferredEntries = allDeferredEntries.filter(deferredEntry => deferredEntry.is(item.sys));
                for (let deferredEntry of deferredEntries) {
                    deferredEntry.resolve(item);
                    promises.push(deferredEntry.promise);
                }
            }
            return Promise.all(promises).then(() => Promise.resolve(list));
        })
            .then((value) => (this.deferredEntries.length > 0) ? this.nestedSearch() : value);
    }
}
class EntryResolver {
    constructor(entry, paths, getEntry) {
        this.entry = entry;
        this.paths = paths;
        this.getEntry = getEntry;
    }
    resolve() {
        let paths = this.paths || Object.keys(this.entry);
        let promises = paths.map(path => {
            let parts = path.split('.');
            let field = parts.shift();
            let promise = null;
            let value = this.entry[field];
            if (value) {
                promise = this.resolveField(value);
                if (!promise && isComposer(value)) {
                    let composerType = (parts.length > 0) ? parts.shift() : null;
                    promise = this.resolveComposerField(value, composerType);
                }
            }
            promise = !promise
                ? Promise.resolve(null)
                : promise.then(resolvedValue => {
                    this.entry[field] = resolvedValue.value;
                    return resolvedValue;
                });
            return promise.then(v => this.next(v, parts.join('.')));
        });
        return Promise.all(promises).then(values => this.entry);
    }
    next(resolvedEntry, path) {
        if (!path || !resolvedEntry || !resolvedEntry.entries || (resolvedEntry.entries.length <= 0)) {
            return Promise.resolve(resolvedEntry);
        }
        let promises = resolvedEntry.entries.map(entry => {
            let resolver = new EntryResolver(entry, [path], (id, language) => this.getEntry(id, language));
            return resolver.resolve();
        });
        return Promise.all(promises);
    }
    resolveField(value) {
        if (isUnresolvedEntry(value)) {
            return this.resolveEntry(value);
        }
        if (isUnresolvedImage(value)) {
            return this.resolveImage(value);
        }
        if (Array.isArray(value)) {
            let isResolving = false;
            let promises = value.map(item => {
                if (isUnresolvedEntry(item)) {
                    isResolving = true;
                    return this.resolveEntry(item);
                }
                if (isUnresolvedImage(item)) {
                    isResolving = true;
                    return this.resolveImage(item);
                }
                return Promise.resolve({ entries: [], value: item });
            });
            if (isResolving) {
                return Promise.all(promises).then((resolvedEntries) => {
                    let list = [];
                    let entries = [];
                    for (let e of resolvedEntries) {
                        list.push(e.value);
                        entries = entries.concat(e.entries);
                    }
                    return { entries, value: list };
                });
            }
        }
        return null;
    }
    resolveComposerField(value, type) {
        if (Array.isArray(value)) {
            let isResolving = false;
            let promises = value.map(item => {
                if (isComposerItem(item)) {
                    if (!type || (type === item.type)) {
                        let itemPromise = this.resolveField(item.value);
                        if (itemPromise) {
                            isResolving = true;
                            return itemPromise.then((v) => {
                                item.value = v;
                                return item;
                            });
                        }
                    }
                }
                return Promise.resolve({ entries: [], value: item });
            });
            if (isResolving) {
                return Promise.all(promises).then((resolvedEntries) => {
                    let list = [];
                    let entries = [];
                    for (let e of resolvedEntries) {
                        list.push(e.value);
                        entries = entries.concat(e.entries);
                    }
                    return { entries, value: list };
                });
            }
        }
        return null;
    }
    resolveEntry(value) {
        if (value && value.sys && value.sys.id) {
            let language = value.sys.language || this.entry.sys.language;
            return this.getEntry(value.sys.id, language).then((entry) => ({ entries: [entry], value: entry }));
        }
        return Promise.resolve({ entries: [], value });
    }
    resolveImage(value) {
        if (value && value.asset && value.asset.sys && value.asset.sys.id) {
            let language = value.asset.sys.language || this.entry.sys.language;
            return this.getEntry(value.asset.sys.id, language)
                .then((image) => {
                value.asset = image;
                return { entries: [image], value };
            });
        }
        return Promise.resolve({ entries: [], value });
    }
}
class LinkResolver {
    constructor(entryOrList, paths, versionStatus, search) {
        this.entryOrList = entryOrList;
        this.paths = paths;
        this.versionStatus = versionStatus;
        this.search = search;
    }
    resolve() {
        let entries = this.getEntries();
        let promise = Promise.resolve([]);
        if (entries.length > 0) {
            let listResolver = new ListResolver(entries, this.paths, this.versionStatus, this.search);
            promise = listResolver.resolve();
        }
        return promise.then(() => this.entryOrList);
    }
    getEntries() {
        let entryOrList = this.entryOrList;
        if (!entryOrList) {
            return [];
        }
        if (Array.isArray(entryOrList)) {
            return entryOrList;
        }
        if (entryOrList.items && Array.isArray(entryOrList.items)) {
            return entryOrList.items;
        }
        return [entryOrList];
    }
}
exports.LinkResolver = LinkResolver;

},{"contensis-core-api":5}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var contensis_core_api_1 = require("contensis-core-api");
exports.Op = contensis_core_api_1.Op;
exports.OrderBy = contensis_core_api_1.OrderBy;
exports.Query = contensis_core_api_1.Query;
exports.ZenqlQuery = contensis_core_api_1.ZenqlQuery;
var client_1 = require("./client/client");
exports.Client = client_1.Client;

},{"./client/client":22,"contensis-core-api":5}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contensis_core_api_1 = require("contensis-core-api");
let nodeDefaultOptionsMappers = {
    language: contensis_core_api_1.defaultMapperForLanguage,
    versionStatus: contensis_core_api_1.defaultMapperForPublishedVersionStatus,
    entryFields: (value) => (value && value.length > 0) ? value : null,
    entryLinkDepth: (value) => (value && (value > 0)) ? value : null,
};
let nodeDefaultWithDepthOptionsMappers = Object.assign({}, nodeDefaultOptionsMappers, { depth: (value) => (value && (value > 0)) ? value : null });
let nodeGetByPathOptions = Object.assign({}, nodeDefaultWithDepthOptionsMappers, { allowPartialMatch: (value) => (!!value) ? true : null });
let nodeGetByEntryOptions = Object.assign({}, nodeDefaultOptionsMappers, { entryId: (value) => (!!value) ? value : null });
let nodeGetAncestorAtLevelOptionsMappers = Object.assign({}, nodeDefaultWithDepthOptionsMappers, { startLevel: (value) => (value && (value > 0)) ? value : null });
let nodeGetAncestorsOptionsMappers = Object.assign({}, nodeDefaultOptionsMappers, { startLevel: (value) => (value && (value > 0)) ? value : null });
class NodeOperations {
    constructor(httpClient, paramsProvider) {
        this.httpClient = httpClient;
        this.paramsProvider = paramsProvider;
        if (!this.httpClient || !this.paramsProvider) {
            throw new Error('The class was not initialised correctly.');
        }
    }
    getRoot(options) {
        let url = contensis_core_api_1.UrlBuilder.create('/api/delivery/projects/:projectId/nodes/root', { language: null, depth: null, versionStatus: null, entryFields: null, entryLinkDepth: null })
            .addOptions(options)
            .setParams(this.paramsProvider.getParams())
            .addMappers(nodeDefaultWithDepthOptionsMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    get(idOrPathOrOptions) {
        const validationMessage = 'A valid node id or path needs to be specified.';
        if ((contensis_core_api_1.isString(idOrPathOrOptions) && !idOrPathOrOptions)
            || (typeof idOrPathOrOptions === 'object' &&
                (idOrPathOrOptions === null || (!idOrPathOrOptions.id && !idOrPathOrOptions.path)))) {
            throw new Error(validationMessage);
        }
        let isPath = (contensis_core_api_1.isString(idOrPathOrOptions) && idOrPathOrOptions.startsWith('/'))
            || (!!idOrPathOrOptions && !!idOrPathOrOptions.path);
        let urlTemplate = isPath ? '/api/delivery/projects/:projectId/nodes:path' : '/api/delivery/projects/:projectId/nodes/:id';
        let url = contensis_core_api_1.UrlBuilder.create(urlTemplate, { language: null, depth: null, versionStatus: null, entryFields: null, entryLinkDepth: null, allowPartialMatch: null })
            .addOptions(idOrPathOrOptions, isPath ? 'path' : 'id')
            .setParams(this.paramsProvider.getParams())
            .addMappers(nodeGetByPathOptions)
            .toUrl();
        return this.httpClient.request(url);
    }
    getByEntry(entryIdOrEntryOrOptions) {
        const validationMessage = 'A valid entry id needs to be specified.';
        if (contensis_core_api_1.isString(entryIdOrEntryOrOptions) && !entryIdOrEntryOrOptions) {
            throw new Error(validationMessage);
        }
        if (typeof entryIdOrEntryOrOptions === 'object') {
            if (entryIdOrEntryOrOptions === null) {
                throw new Error(validationMessage);
            }
            if (!entryIdOrEntryOrOptions.entryId
                && (!entryIdOrEntryOrOptions.entry
                    || !entryIdOrEntryOrOptions.entry.sys
                    || !entryIdOrEntryOrOptions.entry.sys.id)
                && (!entryIdOrEntryOrOptions.sys || !entryIdOrEntryOrOptions.sys.id)) {
                throw new Error(validationMessage);
            }
        }
        let entryId = null;
        if (contensis_core_api_1.isString(entryIdOrEntryOrOptions)) {
            entryId = entryIdOrEntryOrOptions;
        }
        else if (typeof entryIdOrEntryOrOptions === 'object') {
            if (!!entryIdOrEntryOrOptions.sys) {
                entryId = entryIdOrEntryOrOptions.sys.id;
            }
            if (!!entryIdOrEntryOrOptions.entry && !!entryIdOrEntryOrOptions.entry.sys) {
                entryId = entryIdOrEntryOrOptions.entry.sys.id;
            }
        }
        let url = contensis_core_api_1.UrlBuilder
            .create('/api/delivery/projects/:projectId/nodes/', { entryId: null, language: null, versionStatus: null, entryFields: null, entryLinkDepth: null })
            .addOptions(entryId, 'entryId')
            .addOptions(entryIdOrEntryOrOptions)
            .setParams(this.paramsProvider.getParams())
            .addMappers(nodeGetByEntryOptions)
            .toUrl();
        return this.httpClient.request(url);
    }
    getChildren(idOrNodeOrOptions) {
        this.validateNodeId(idOrNodeOrOptions);
        let nodeId = this.getNodeIdFromOptions(idOrNodeOrOptions);
        let url = contensis_core_api_1.UrlBuilder
            .create('/api/delivery/projects/:projectId/nodes/:id/children', { language: null, versionStatus: null, entryFields: null, entryLinkDepth: null })
            .addOptions(nodeId, 'id')
            .addOptions(idOrNodeOrOptions)
            .setParams(this.paramsProvider.getParams())
            .addMappers(nodeDefaultOptionsMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    getParent(idOrNodeOrOptions) {
        this.validateNodeId(idOrNodeOrOptions);
        let nodeId = this.getNodeIdFromOptions(idOrNodeOrOptions);
        let url = contensis_core_api_1.UrlBuilder
            .create('/api/delivery/projects/:projectId/nodes/:id/parent', { language: null, depth: null, versionStatus: null, entryFields: null, entryLinkDepth: null })
            .addOptions(nodeId, 'id')
            .addOptions(idOrNodeOrOptions)
            .setParams(this.paramsProvider.getParams())
            .addMappers(nodeDefaultWithDepthOptionsMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    getAncestorAtLevel(options) {
        this.validateNodeId(options);
        let nodeId = this.getNodeIdFromOptions(options);
        let url = contensis_core_api_1.UrlBuilder
            .create('/api/delivery/projects/:projectId/nodes/:id/ancestor', { language: null, startLevel: null, depth: null, versionStatus: null, entryFields: null, entryLinkDepth: null })
            .addOptions(nodeId, 'id')
            .addOptions(options)
            .setParams(this.paramsProvider.getParams())
            .addMappers(nodeGetAncestorAtLevelOptionsMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    getAncestors(idOrNodeOrOptions) {
        this.validateNodeId(idOrNodeOrOptions);
        let nodeId = this.getNodeIdFromOptions(idOrNodeOrOptions);
        let url = contensis_core_api_1.UrlBuilder
            .create('/api/delivery/projects/:projectId/nodes/:id/ancestors', { language: null, startLevel: null, versionStatus: null, entryFields: null, entryLinkDepth: null })
            .addOptions(nodeId, 'id')
            .addOptions(idOrNodeOrOptions)
            .setParams(this.paramsProvider.getParams())
            .addMappers(nodeGetAncestorsOptionsMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    getSiblings(idOrNodeOrOptions) {
        this.validateNodeId(idOrNodeOrOptions);
        let nodeId = this.getNodeIdFromOptions(idOrNodeOrOptions);
        let url = contensis_core_api_1.UrlBuilder
            .create('/api/delivery/projects/:projectId/nodes/:id/siblings', { language: null, versionStatus: null, entryFields: null, entryLinkDepth: null })
            .addOptions(nodeId, 'id')
            .addOptions(idOrNodeOrOptions)
            .setParams(this.paramsProvider.getParams())
            .addMappers(nodeDefaultOptionsMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    validateNodeId(idOrNodeOrOptions) {
        const validationMessage = 'A valid node id needs to be specified.';
        if (contensis_core_api_1.isString(idOrNodeOrOptions) && !idOrNodeOrOptions) {
            throw new Error(validationMessage);
        }
        if (typeof idOrNodeOrOptions === 'object') {
            if (idOrNodeOrOptions === null) {
                throw new Error(validationMessage);
            }
            if (!idOrNodeOrOptions.id
                && (!idOrNodeOrOptions.node
                    || !idOrNodeOrOptions.node.id)) {
                throw new Error(validationMessage);
            }
        }
    }
    getNodeIdFromOptions(idOrNodeOrOptions) {
        let nodeId = null;
        if (contensis_core_api_1.isString(idOrNodeOrOptions)) {
            nodeId = idOrNodeOrOptions;
        }
        else if (typeof idOrNodeOrOptions === 'object') {
            if (!!idOrNodeOrOptions.id) {
                nodeId = idOrNodeOrOptions.id;
            }
            else if (!!idOrNodeOrOptions.node) {
                nodeId = idOrNodeOrOptions.node.id;
            }
        }
        return nodeId;
    }
}
exports.NodeOperations = NodeOperations;

},{"contensis-core-api":5}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contensis_core_api_1 = require("contensis-core-api");
class ProjectOperations {
    constructor(httpClient, paramsProvider) {
        this.httpClient = httpClient;
        this.paramsProvider = paramsProvider;
    }
    get() {
        let url = contensis_core_api_1.UrlBuilder.create('/api/delivery/projects/:projectId')
            .setParams(this.paramsProvider.getParams())
            .toUrl();
        return this.httpClient.request(url);
    }
}
exports.ProjectOperations = ProjectOperations;

},{"contensis-core-api":5}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contensis_core_api_1 = require("contensis-core-api");
let taxonomyMappers = {
    order: (value) => (value === 'defined') ? value : null
};
class TaxonomyOperations {
    constructor(httpClient, paramsProvider) {
        this.httpClient = httpClient;
        this.paramsProvider = paramsProvider;
    }
    getNodeByKey(key) {
        let url = contensis_core_api_1.UrlBuilder.create('/api/delivery/projects/:projectId/taxonomy/nodes/:key', { order: null, childDepth: null, language: null })
            .addOptions(key, 'key')
            .setParams(this.paramsProvider.getParams())
            .addMappers(taxonomyMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    getNodeByPath(path) {
        let url = contensis_core_api_1.UrlBuilder.create('/api/delivery/projects/:projectId/taxonomy/nodes', { order: null, childDepth: null, language: null, path: null })
            .addOptions(path, 'path')
            .setParams(this.paramsProvider.getParams())
            .addMappers(taxonomyMappers)
            .toUrl();
        return this.httpClient.request(url);
    }
    resolveChildren(node) {
        let resolveOptions = node;
        let taxonomyNodeOrKey = null;
        let getNodeByKeyOptions = { childDepth: 1 };
        if (resolveOptions.node) {
            taxonomyNodeOrKey = resolveOptions.node;
            getNodeByKeyOptions = { childDepth: resolveOptions.childDepth || 1, order: resolveOptions.order, language: resolveOptions.language };
        }
        else if (resolveOptions.key) {
            if (node.path) {
                taxonomyNodeOrKey = node;
            }
            else {
                taxonomyNodeOrKey = resolveOptions.key;
                getNodeByKeyOptions = { childDepth: resolveOptions.childDepth || 1, order: resolveOptions.order, language: resolveOptions.language };
            }
        }
        else {
            taxonomyNodeOrKey = node;
        }
        if (typeof taxonomyNodeOrKey === 'string') {
            return this.getNodeByKey(Object.assign({}, getNodeByKeyOptions, { key: taxonomyNodeOrKey }));
        }
        if (!taxonomyNodeOrKey.hasChildren) {
            return Promise.resolve(Object.assign({}, taxonomyNodeOrKey, { children: [] }));
        }
        else if (taxonomyNodeOrKey.children && (taxonomyNodeOrKey.children.length > 0)) {
            return Promise.resolve(Object.assign({}, taxonomyNodeOrKey));
        }
        return this.getNodeByKey(Object.assign({}, getNodeByKeyOptions, { key: taxonomyNodeOrKey.key }));
    }
}
exports.TaxonomyOperations = TaxonomyOperations;

},{"contensis-core-api":5}],30:[function(require,module,exports){
var global = typeof self !== 'undefined' ? self : this;
var __self__ = (function () {
function F() {
this.fetch = false;
this.DOMException = global.DOMException
}
F.prototype = global;
return new F();
})();
(function(self) {

var irrelevant = (function (exports) {

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
})(__self__);
__self__.fetch.ponyfill = true;
// Remove "polyfill" property added by whatwg-fetch
delete __self__.fetch.polyfill;
// Choose between native implementation (global) or custom implementation (__self__)
// var ctx = global.fetch ? global : __self__;
var ctx = __self__; // this line disable service worker support temporarily
exports = ctx.fetch // To enable: import fetch from 'cross-fetch'
exports.default = ctx.fetch // For TypeScript consumers without esModuleInterop.
exports.fetch = ctx.fetch // To enable: import {fetch} from 'cross-fetch'
exports.Headers = ctx.Headers
exports.Request = ctx.Request
exports.Response = ctx.Response
module.exports = exports

},{}],31:[function(require,module,exports){
module.exports = false;


},{}],32:[function(require,module,exports){
(function (global){(function (){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
var __createBinding;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __createBinding = function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
