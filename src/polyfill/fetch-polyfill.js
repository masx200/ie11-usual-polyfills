export default () => {
    var support = {
        searchParams: "URLSearchParams" in self,
        iterable: "Symbol" in self && "iterator" in Symbol,
        blob:
            "FileReader" in self &&
            "Blob" in self &&
            (function () {
                try {
                    return new Blob(), !0;
                } catch (e) {
                    return !1;
                }
            })(),
        formData: "FormData" in self,
        arrayBuffer: "ArrayBuffer" in self,
    };
    function isDataView(e) {
        return e && DataView.prototype.isPrototypeOf(e);
    }
    if (support.arrayBuffer)
        var viewClasses = [
                "[object Int8Array]",
                "[object Uint8Array]",
                "[object Uint8ClampedArray]",
                "[object Int16Array]",
                "[object Uint16Array]",
                "[object Int32Array]",
                "[object Uint32Array]",
                "[object Float32Array]",
                "[object Float64Array]",
            ],
            isArrayBufferView =
                ArrayBuffer.isView ||
                function (e) {
                    return (
                        e &&
                        viewClasses.indexOf(Object.prototype.toString.call(e)) >
                            -1
                    );
                };
    function normalizeName(e) {
        if (
            ("string" != typeof e && (e = String(e)),
            /[^a-z0-9\-#$%&'*+.^_`|~]/i.test(e))
        )
            throw new TypeError("Invalid character in header field name");
        return e.toLowerCase();
    }
    function normalizeValue(e) {
        return "string" != typeof e && (e = String(e)), e;
    }
    function iteratorFor(e) {
        var t = {
            next: function () {
                var t = e.shift();
                return { done: void 0 === t, value: t };
            },
        };
        return (
            support.iterable &&
                (t[Symbol.iterator] = function () {
                    return t;
                }),
            t
        );
    }
    /* export  */ function Headers(e) {
        (this.map = {}),
            e instanceof Headers
                ? e.forEach(function (e, t) {
                      this.append(t, e);
                  }, this)
                : Array.isArray(e)
                ? e.forEach(function (e) {
                      this.append(e[0], e[1]);
                  }, this)
                : e &&
                  Object.getOwnPropertyNames(e).forEach(function (t) {
                      this.append(t, e[t]);
                  }, this);
    }
    function consumed(e) {
        if (e.bodyUsed) return Promise.reject(new TypeError("Already read"));
        e.bodyUsed = !0;
    }
    function fileReaderReady(e) {
        return new Promise(function (t, r) {
            (e.onload = function () {
                t(e.result);
            }),
                (e.onerror = function () {
                    r(e.error);
                });
        });
    }
    function readBlobAsArrayBuffer(e) {
        var t = new FileReader(),
            r = fileReaderReady(t);
        return t.readAsArrayBuffer(e), r;
    }
    function readBlobAsText(e) {
        var t = new FileReader(),
            r = fileReaderReady(t);
        return t.readAsText(e), r;
    }
    function readArrayBufferAsText(e) {
        for (
            var t = new Uint8Array(e), r = new Array(t.length), o = 0;
            o < t.length;
            o++
        )
            r[o] = String.fromCharCode(t[o]);
        return r.join("");
    }
    function bufferClone(e) {
        if (e.slice) return e.slice(0);
        var t = new Uint8Array(e.byteLength);
        return t.set(new Uint8Array(e)), t.buffer;
    }
    function Body() {
        return (
            (this.bodyUsed = !1),
            (this._initBody = function (e) {
                (this._bodyInit = e),
                    e
                        ? "string" == typeof e
                            ? (this._bodyText = e)
                            : support.blob && Blob.prototype.isPrototypeOf(e)
                            ? (this._bodyBlob = e)
                            : support.formData &&
                              FormData.prototype.isPrototypeOf(e)
                            ? (this._bodyFormData = e)
                            : support.searchParams &&
                              URLSearchParams.prototype.isPrototypeOf(e)
                            ? (this._bodyText = e.toString())
                            : support.arrayBuffer &&
                              support.blob &&
                              isDataView(e)
                            ? ((this._bodyArrayBuffer = bufferClone(e.buffer)),
                              (this._bodyInit = new Blob([
                                  this._bodyArrayBuffer,
                              ])))
                            : support.arrayBuffer &&
                              (ArrayBuffer.prototype.isPrototypeOf(e) ||
                                  isArrayBufferView(e))
                            ? (this._bodyArrayBuffer = bufferClone(e))
                            : (this._bodyText = e =
                                  Object.prototype.toString.call(e))
                        : (this._bodyText = ""),
                    this.headers.get("content-type") ||
                        ("string" == typeof e
                            ? this.headers.set(
                                  "content-type",
                                  "text/plain;charset=UTF-8"
                              )
                            : this._bodyBlob && this._bodyBlob.type
                            ? this.headers.set(
                                  "content-type",
                                  this._bodyBlob.type
                              )
                            : support.searchParams &&
                              URLSearchParams.prototype.isPrototypeOf(e) &&
                              this.headers.set(
                                  "content-type",
                                  "application/x-www-form-urlencoded;charset=UTF-8"
                              ));
            }),
            support.blob &&
                ((this.blob = function () {
                    var e = consumed(this);
                    if (e) return e;
                    if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
                    if (this._bodyArrayBuffer)
                        return Promise.resolve(
                            new Blob([this._bodyArrayBuffer])
                        );
                    if (this._bodyFormData)
                        throw new Error("could not read FormData body as blob");
                    return Promise.resolve(new Blob([this._bodyText]));
                }),
                (this.arrayBuffer = function () {
                    return this._bodyArrayBuffer
                        ? consumed(this) ||
                              Promise.resolve(this._bodyArrayBuffer)
                        : this.blob().then(readBlobAsArrayBuffer);
                })),
            (this.text = function () {
                var e = consumed(this);
                if (e) return e;
                if (this._bodyBlob) return readBlobAsText(this._bodyBlob);
                if (this._bodyArrayBuffer)
                    return Promise.resolve(
                        readArrayBufferAsText(this._bodyArrayBuffer)
                    );
                if (this._bodyFormData)
                    throw new Error("could not read FormData body as text");
                return Promise.resolve(this._bodyText);
            }),
            support.formData &&
                (this.formData = function () {
                    return this.text().then(decode);
                }),
            (this.json = function () {
                return this.text().then(JSON.parse);
            }),
            this
        );
    }
    (Headers.prototype.append = function (e, t) {
        (e = normalizeName(e)), (t = normalizeValue(t));
        var r = this.map[e];
        this.map[e] = r ? r + ", " + t : t;
    }),
        (Headers.prototype.delete = function (e) {
            delete this.map[normalizeName(e)];
        }),
        (Headers.prototype.get = function (e) {
            return (e = normalizeName(e)), this.has(e) ? this.map[e] : null;
        }),
        (Headers.prototype.has = function (e) {
            return this.map.hasOwnProperty(normalizeName(e));
        }),
        (Headers.prototype.set = function (e, t) {
            this.map[normalizeName(e)] = normalizeValue(t);
        }),
        (Headers.prototype.forEach = function (e, t) {
            for (var r in this.map)
                this.map.hasOwnProperty(r) && e.call(t, this.map[r], r, this);
        }),
        (Headers.prototype.keys = function () {
            var e = [];
            return (
                this.forEach(function (t, r) {
                    e.push(r);
                }),
                iteratorFor(e)
            );
        }),
        (Headers.prototype.values = function () {
            var e = [];
            return (
                this.forEach(function (t) {
                    e.push(t);
                }),
                iteratorFor(e)
            );
        }),
        (Headers.prototype.entries = function () {
            var e = [];
            return (
                this.forEach(function (t, r) {
                    e.push([r, t]);
                }),
                iteratorFor(e)
            );
        }),
        support.iterable &&
            (Headers.prototype[Symbol.iterator] = Headers.prototype.entries);
    var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
    function normalizeMethod(e) {
        var t = e.toUpperCase();
        return methods.indexOf(t) > -1 ? t : e;
    }
    /* export  */ function Request(e, t) {
        var r = (t = t || {}).body;
        if (e instanceof Request) {
            if (e.bodyUsed) throw new TypeError("Already read");
            (this.url = e.url),
                (this.credentials = e.credentials),
                t.headers || (this.headers = new Headers(e.headers)),
                (this.method = e.method),
                (this.mode = e.mode),
                (this.signal = e.signal),
                r ||
                    null == e._bodyInit ||
                    ((r = e._bodyInit), (e.bodyUsed = !0));
        } else this.url = String(e);
        if (
            ((this.credentials =
                t.credentials || this.credentials || "same-origin"),
            (!t.headers && this.headers) ||
                (this.headers = new Headers(t.headers)),
            (this.method = normalizeMethod(t.method || this.method || "GET")),
            (this.mode = t.mode || this.mode || null),
            (this.signal = t.signal || this.signal),
            (this.referrer = null),
            ("GET" === this.method || "HEAD" === this.method) && r)
        )
            throw new TypeError("Body not allowed for GET or HEAD requests");
        this._initBody(r);
    }
    function decode(e) {
        var t = new FormData();
        return (
            e
                .trim()
                .split("&")
                .forEach(function (e) {
                    if (e) {
                        var r = e.split("="),
                            o = r.shift().replace(/\+/g, " "),
                            s = r.join("=").replace(/\+/g, " ");
                        t.append(decodeURIComponent(o), decodeURIComponent(s));
                    }
                }),
            t
        );
    }
    function parseHeaders(e) {
        var t = new Headers();
        return (
            e
                .replace(/\r?\n[\t ]+/g, " ")
                .split(/\r?\n/)
                .forEach(function (e) {
                    var r = e.split(":"),
                        o = r.shift().trim();
                    if (o) {
                        var s = r.join(":").trim();
                        t.append(o, s);
                    }
                }),
            t
        );
    }
    (Request.prototype.clone = function () {
        return new Request(this, { body: this._bodyInit });
    }),
        Body.call(Request.prototype);
    /* export  */ function Response(e, t) {
        t || (t = {}),
            (this.type = "default"),
            (this.status = void 0 === t.status ? 200 : t.status),
            (this.ok = this.status >= 200 && this.status < 300),
            (this.statusText = "statusText" in t ? t.statusText : "OK"),
            (this.headers = new Headers(t.headers)),
            (this.url = t.url || ""),
            this._initBody(e);
    }
    Body.call(Response.prototype),
        (Response.prototype.clone = function () {
            return new Response(this._bodyInit, {
                status: this.status,
                statusText: this.statusText,
                headers: new Headers(this.headers),
                url: this.url,
            });
        }),
        (Response.error = function () {
            var e = new Response(null, { status: 0, statusText: "" });
            return (e.type = "error"), e;
        });
    var redirectStatuses = [301, 302, 303, 307, 308];
    Response.redirect = function (e, t) {
        if (-1 === redirectStatuses.indexOf(t))
            throw new RangeError("Invalid status code");
        return new Response(null, { status: t, headers: { location: e } });
    };
    /* export  */ var DOMException = self.DOMException;
    try {
        new DOMException();
    } catch (e) {
        ((DOMException = function (e, t) {
            (this.message = e), (this.name = t);
            var r = Error(e);
            this.stack = r.stack;
        }).prototype = Object.create(Error.prototype)),
            (DOMException.prototype.constructor = DOMException);
    }
    /*  export  */ function fetch(e, t) {
        return new Promise(function (r, o) {
            var s = new Request(e, t);
            if (s.signal && s.signal.aborted)
                return o(new DOMException("Aborted", "AbortError"));
            var n = new XMLHttpRequest();
            function i() {
                n.abort();
            }
            (n.onload = function () {
                var e = {
                    status: n.status,
                    statusText: n.statusText,
                    headers: parseHeaders(n.getAllResponseHeaders() || ""),
                };
                e.url =
                    "responseURL" in n
                        ? n.responseURL
                        : e.headers.get("X-Request-URL");
                var t = "response" in n ? n.response : n.responseText;
                r(new Response(t, e));
            }),
                (n.onerror = function () {
                    o(new TypeError("Network request failed"));
                }),
                (n.ontimeout = function () {
                    o(new TypeError("Network request failed"));
                }),
                (n.onabort = function () {
                    o(new DOMException("Aborted", "AbortError"));
                }),
                n.open(s.method, s.url, !0),
                "include" === s.credentials
                    ? (n.withCredentials = !0)
                    : "omit" === s.credentials && (n.withCredentials = !1),
                "responseType" in n &&
                    support.blob &&
                    (n.responseType = "blob"),
                s.headers.forEach(function (e, t) {
                    n.setRequestHeader(t, e);
                }),
                s.signal &&
                    (s.signal.addEventListener("abort", i),
                    (n.onreadystatechange = function () {
                        4 === n.readyState &&
                            s.signal.removeEventListener("abort", i);
                    })),
                n.send(void 0 === s._bodyInit ? null : s._bodyInit);
        });
    }
    (fetch.polyfill = !0),
        self.fetch ||
            ((self.fetch = fetch),
            (self.Headers = Headers),
            (self.Request = Request),
            (self.Response = Response));
};
