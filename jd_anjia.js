/*
组队分豆-安佳 [jd_anjia.js]
————————————————
入口：[组队分豆-安佳 (https://lzkjdz-isv.isvjcloud.com/pool/captain/15935?activityId=9222c59c4de14e039d124ba1d88d7004&shareUuid=b8807b8efe3d4a34bb3c74fa7724c993)]
IOS等用户直接用NobyDa的jd cookie
cron "1 0,7,12 * * *" script-path=jd_anjia.js,tag=组队分豆-安佳
*/
const $ = new Env("组队分豆-安佳");
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : "";
const notify = $.isNode() ? require("./sendNotify") : "";
let cookiesArr = [],
  cookie = "",
  message = "";
let ownCode = null;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item]);
  });
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === "false")
    console.log = () => {};
} else {
  let cookiesData = $.getdata("CookiesJD") || "[]";
  cookiesData = JSON.parse(cookiesData);
  cookiesArr = cookiesData.map((item) => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata("CookieJD2"), $.getdata("CookieJD")]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter((item) => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg(
      $.name,
      "【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取",
      "https://bean.m.jd.com/bean/signIndex.action",
      { "open-url": "https://bean.m.jd.com/bean/signIndex.action" }
    );
    return;
  }
  console.log(
    `若之前做过该活动，则无法重复入队。\n入口:\nhttps://lzkjdz-isv.isvjcloud.com/pool/captain/15935?activityId=9222c59c4de14e039d124ba1d88d7004&shareUuid=b8807b8efe3d4a34bb3c74fa7724c993`
  );

  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      originCookie = cookiesArr[i];
      newCookie = "";
      $.UserName = decodeURIComponent(
        cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]
      );
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = "";
      await checkCookie();
      console.log(
        `\n******开始【京东账号${$.index}】${
          $.nickName || $.UserName
        }*********\n`
      );
      if (!$.isLogin) {
        $.msg(
          $.name,
          `【提示】cookie已失效`,
          `京东账号${$.index} ${
            $.nickName || $.UserName
          }\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`,
          { "open-url": "https://bean.m.jd.com/bean/signIndex.action" }
        );
        if ($.isNode()) {
          await notify.sendNotify(
            `${$.name}cookie已失效 - ${$.UserName}`,
            `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`
          );
        }
        continue;
      }
      authorCodeList = [];
      $.bean = 0;
      $.authorCode = ownCode
        ? ownCode
        : authorCodeList[random(0, authorCodeList.length)];
      $.activityId = "9222c59c4de14e039d124ba1d88d7004";
      $.activityShopId = "1000014486";
      $.randomNum = random(1000000, 9999999);
      $.activityUrl = `https://lzkjdz-isv.isvjcloud.com/pool/captain/${
        $.randomNum
      }?activityId=${$.activityId}&signUuid=${encodeURIComponent(
        $.authorCode
      )}&adsource=null&shareuserid4minipg=null&shopid=${
        $.activityShopId
      }&lng=00.000000&lat=00.000000&sid=&un_area=`;
      $.returnUrl = `https://lzkjdz-isv.isvjcloud.com/pool/captain/${$.randomNum}?activityId=${$.activityId}`;
      await anjia();
      await $.wait(3000);
      if ($.bean > 0) {
        message += `\n【京东账号${$.index}】${
          $.nickName || $.UserName
        } \n       └ 获得 ${$.bean} 京豆。`;
      }
    }
  }
  if (message !== "") {
    if ($.isNode()) {
      await notify.sendNotify($.name, message, "", `\n`);
    } else {
      $.msg($.name, "", message);
    }
  }
})()
  .catch((e) => {
    $.log("", `❌ ${$.name}, 失败! 原因: ${e}!`, "");
  })
  .finally(() => {
    $.done();
  });

async function anjia() {
  $.token = null;
  $.secretPin = null;
  $.openCardActivityId = null;
  await getFirstLZCK();
  await getToken();
  await task("customer/getSimpleActInfoVo", `activityId=${$.activityId}`, 1);
  await $.wait(2000);
  if ($.token) {
    await getMyPing();
    if ($.secretPin) {
      console.log("加入队伍 -> " + $.authorCode);
      await task(
        "common/accessLogWithAD",
        `venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent(
          $.secretPin
        )}&activityId=${$.activityId}&pageUrl=${
          $.activityUrl
        }&subType=app&adSource=null`,
        1
      );
      await $.wait(2000);
      await task(
        "activityContent",
        `activityId=${$.activityId}&pin=${encodeURIComponent(
          $.secretPin
        )}&signUuid=${encodeURIComponent($.authorCode)}`
      );
      if ($.activityContent) {
        if ($.activityContent.canJoin) {
          $.log("加入队伍成功，请等待队长瓜分京豆");
          await $.wait(2000);
          await task(
            "saveCandidate",
            `activityId=${$.activityId}&pin=${encodeURIComponent(
              $.secretPin
            )}&signUuid=${encodeURIComponent(
              $.authorCode
            )}&pinImg=${encodeURIComponent(
              `https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg`
            )}`
          );
          $.log("加入会员");
          if (!$.activityContent.openCard) {
            $.log("加入会员");
            await $.wait(2000);
            await getShopOpenCardInfo(
              { venderId: "1000014486", channel: 401 },
              1000014486
            );
            await bindWithVender(
              {
                venderId: "1000014486",
                shopId: "1000014486",
                bindByVerifyCodeFlag: 1,
                registerExtend: {},
                writeChildFlag: 0,
                activityId: 3282318,
                channel: 401,
              },
              100000000000085
            );
          }
          await $.wait(2000);
          await task(
            "activityContent",
            `activityId=${$.activityId}&pin=${encodeURIComponent(
              $.secretPin
            )}&signUuid=${encodeURIComponent($.authorCode)}`,
            0,
            1
          );
          await $.wait(2000);
          if ($.index === 1) {
            if ($.activityContent.canCreate) {
              $.log("创建队伍");
              await $.wait(2000);
              await task(
                "saveCaptain",
                `activityId=${$.activityId}&pin=${encodeURIComponent(
                  $.secretPin
                )}&pinImg=${encodeURIComponent(
                  `https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg`
                )}`
              );
            }
          }
        } else {
          if ($.index === 1) {
            $.log("创建队伍");
            if ($.activityContent.canCreate) {
              await $.wait(2000);
              await task(
                "saveCaptain",
                `activityId=${$.activityId}&pin=${encodeURIComponent(
                  $.secretPin
                )}&pinImg=${encodeURIComponent(
                  `https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg`
                )}`
              );
            } else {
              $.log("你已经是队长了");
              ownCode = $.activityContent.signUuid;
              console.log(ownCode);
            }
          } else {
            $.log("无法加入队伍");
          }
          // await $.wait(2000)
        }
      }
    } else {
      $.log("没有成功获取到用户信息");
    }
  } else {
    $.log("没有成功获取到用户鉴权信息");
  }
}

function task(function_id, body, isCommon = 0) {
  return new Promise((resolve) => {
    $.post(taskUrl(function_id, body, isCommon), async (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.result) {
              switch (function_id) {
                case "saveCaptain":
                  if (data.data.signUuid) {
                    $.log("创建队伍成功");
                    if ($.index === 1) {
                      ownCode = data.data.signUuid;
                    }
                  }
                  break;
                case "dz/common/getSimpleActInfoVo":
                  $.jdActivityId = data.data.jdActivityId;
                  $.venderId = data.data.venderId;
                  break;
                case "wxActionCommon/getUserInfo":
                  $.nickname = data.data.nickname;
                  $.pinImg =
                    "https://img10.360buyimg.com/imgzone/jfs/t1/7020/27/13511/6142/5c5138d8E4df2e764/5a1216a3a5043c5d.png";
                  break;
                case "activityContent":
                  // console.log(data.data)
                  $.activityContent = data.data;
                  if ($.index === 1) {
                    ownCode = data.data.signUuid;
                  }
                  // $.actorUuid = data.data.signUuid;
                  // console.log(data.data.successRetList)
                  // for (const vo of data.data.successRetList) {
                  //     if (!vo.sendStatus && vo.canSend) {
                  //         // console.log(vo)
                  //         await task('updateCaptain', `uuid=${vo.memberList[0].captainId}`)
                  //         await $.wait(3000)
                  //     }
                  // }
                  break;
                case "updateCaptain":
                  console.log(data.data);

                  break;
                default:
                  // $.log(JSON.stringify(data))
                  break;
              }
            } else {
              $.log(JSON.stringify(data));
            }
          } else {
            // $.log("京东没有返回数据")
          }
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function getShopOpenCardInfo(body, venderId) {
  let opt = {
    url: `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=getShopOpenCardInfo&body=${encodeURIComponent(
      JSON.stringify(body)
    )}&client=H5&clientVersion=9.2.0&uuid=88888`,
    headers: {
      Host: "api.m.jd.com",
      Accept: "*/*",
      Connection: "keep-alive",
      Cookie: cookie,
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${getUUID(
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      )};network/wifi;ADID/${getUUID(
        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        1
      )};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      "Accept-Language": "zh-cn",
      Referer: `https://shopmember.m.jd.com/shopcard/?venderId=${venderId}}&channel=7005&returnUrl=${encodeURIComponent(
        $.returnUrl
      )}`,
      "Accept-Encoding": "gzip, deflate, br",
    },
  };
  return new Promise((resolve) => {
    $.get(opt, (err, resp, data) => {
      try {
        if (err) {
          console.log(err);
        } else {
          res = JSON.parse(data);
          if (res.success) {
            if (res.result.interestsRuleList) {
              $.openCardActivityId =
                res.result.interestsRuleList[0].interestsInfo.activityId;
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function bindWithVender(body, venderId) {
  let opt = {
    url: `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body=${encodeURIComponent(
      JSON.stringify(body)
    )}&client=H5&clientVersion=9.2.0&uuid=88888`,
    headers: {
      Host: "api.m.jd.com",
      Accept: "*/*",
      Connection: "keep-alive",
      Cookie: cookie,
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${getUUID(
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      )};network/wifi;ADID/${getUUID(
        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        1
      )};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      "Accept-Language": "zh-cn",
      Referer: `https://shopmember.m.jd.com/shopcard/?venderId=${venderId}}&channel=7005&returnUrl=${encodeURIComponent(
        $.returnUrl
      )}`,
      "Accept-Encoding": "gzip, deflate, br",
    },
  };
  return new Promise((resolve) => {
    $.get(opt, (err, resp, data) => {
      try {
        if (err) {
          console.log(err);
        } else {
          res = JSON.parse(data);
          if (res.success) {
            if (res.result.giftInfo && res.result.giftInfo.giftList) {
              for (const vo of res.result.giftInfo.giftList) {
                if (vo.prizeType === 4) {
                  $.log(`==>获得【${vo.quantity}】京豆`);
                  $.bean += vo.quantity;
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function taskUrl(function_id, body, isCommon) {
  return {
    url: isCommon
      ? `https://lzkjdz-isv.isvjcloud.com/${function_id}`
      : `https://lzkjdz-isv.isvjcloud.com/pool/${function_id}`,
    headers: {
      Host: "lzkjdz-isv.isvjcloud.com",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://lzkjdz-isv.isvjcloud.comm",
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${getUUID(
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      )};network/wifi;ADID/${getUUID(
        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        1
      )};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Connection: "keep-alive",
      Referer: $.activityUrl,
      Cookie: cookie,
    },
    body: body,
  };
}

function getMyPing() {
  let opt = {
    url: `https://lzkjdz-isv.isvjcloud.com/customer/getMyPing`,
    headers: {
      Host: "lzkjdz-isv.isvjcloud.com",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://lzkjdz-isv.isvjcloud.com",
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${getUUID(
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      )};network/wifi;ADID/${getUUID(
        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        1
      )};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Connection: "keep-alive",
      Referer: $.activityUrl,
      Cookie: cookie,
    },
    body: `userId=${$.activityShopId}&token=${$.token}&fromType=APP&riskType=1`,
  };
  return new Promise((resolve) => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          if (resp["headers"]["set-cookie"]) {
            cookie = `${originCookie}`;
            if ($.isNode()) {
              for (let sk of resp["headers"]["set-cookie"]) {
                cookie = `${cookie}${sk.split(";")[0]};`;
              }
            } else {
              for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                cookie = `${cookie}${ck.split(";")[0]};`;
              }
            }
          }
          if (resp["headers"]["Set-Cookie"]) {
            cookie = `${originCookie}`;
            if ($.isNode()) {
              for (let sk of resp["headers"]["set-cookie"]) {
                cookie = `${cookie}${sk.split(";")[0]};`;
              }
            } else {
              for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                cookie = `${cookie}${ck.split(";")[0]};`;
              }
            }
          }
          if (data) {
            data = JSON.parse(data);
            if (data.result) {
              //$.log(`你好：${data.data.nickname}`)
              $.pin = data.data.nickname;
              $.secretPin = data.data.secretPin;
              cookie = `${cookie};AUTH_C_USER=${data.data.secretPin}`;
            } else {
              $.log(data.errorMessage);
            }
          } else {
            $.log("京东返回了空数据");
          }
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function getFirstLZCK() {
  return new Promise((resolve) => {
    $.get({ url: $.activityUrl }, (err, resp, data) => {
      try {
        if (err) {
          console.log(err);
        } else {
          if (resp["headers"]["set-cookie"]) {
            cookie = `${originCookie}`;
            if ($.isNode()) {
              for (let sk of resp["headers"]["set-cookie"]) {
                cookie = `${cookie}${sk.split(";")[0]};`;
              }
            } else {
              for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                cookie = `${cookie}${ck.split(";")[0]};`;
              }
            }
          }
          if (resp["headers"]["Set-Cookie"]) {
            cookie = `${originCookie}`;
            if ($.isNode()) {
              for (let sk of resp["headers"]["set-cookie"]) {
                cookie = `${cookie}${sk.split(";")[0]};`;
              }
            } else {
              for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                cookie = `${cookie}${ck.split(";")[0]};`;
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function getToken() {
  let opt = {
    url: `https://api.m.jd.com/client.action?functionId=isvObfuscator`,
    headers: {
      Host: "api.m.jd.com",
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*",
      Connection: "keep-alive",
      Cookie: cookie,
      "User-Agent": "JD4iPhone/167650 (iPhone; iOS 13.7; Scale/3.00)",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Accept-Encoding": "gzip, deflate, br",
    },
    body: `body=%7B%22url%22%3A%20%22https%3A//lzdz1-isv.isvjcloud.com%22%2C%20%22id%22%3A%20%22%22%7D&uuid=72124265217d48b7955781024d65bbc4&client=apple&clientVersion=9.4.0&st=1621796702000&sv=120&sign=14f7faa31356c74e9f4289972db4b988`,
  };
  return new Promise((resolve) => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.code === "0") {
              $.token = data.token;
            }
          } else {
            $.log("京东返回了空数据");
          }
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function getUUID(
  format = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  UpperCase = 0
) {
  return format.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    if (UpperCase) {
      uuid = v.toString(36).toUpperCase();
    } else {
      uuid = v.toString(36);
    }
    return uuid;
  });
}
function checkCookie() {
  const options = {
    url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
    headers: {
      Host: "me-api.jd.com",
      Accept: "*/*",
      Connection: "keep-alive",
      Cookie: cookie,
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1",
      "Accept-Language": "zh-cn",
      Referer: "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
      "Accept-Encoding": "gzip, deflate, br",
    },
  };
  return new Promise((resolve) => {
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err);
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.retcode === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data.retcode === "0" && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log("京东返回了空数据");
          }
        }
      } catch (e) {
        $.logErr(e);
      } finally {
        resolve();
      }
    });
  });
}

// prettier-ignore
!function (n) { "use strict"; function t(n, t) { var r = (65535 & n) + (65535 & t); return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r } function r(n, t) { return n << t | n >>> 32 - t } function e(n, e, o, u, c, f) { return t(r(t(t(e, n), t(u, f)), c), o) } function o(n, t, r, o, u, c, f) { return e(t & r | ~t & o, n, t, u, c, f) } function u(n, t, r, o, u, c, f) { return e(t & o | r & ~o, n, t, u, c, f) } function c(n, t, r, o, u, c, f) { return e(t ^ r ^ o, n, t, u, c, f) } function f(n, t, r, o, u, c, f) { return e(r ^ (t | ~o), n, t, u, c, f) } function i(n, r) { n[r >> 5] |= 128 << r % 32, n[14 + (r + 64 >>> 9 << 4)] = r; var e, i, a, d, h, l = 1732584193, g = -271733879, v = -1732584194, m = 271733878; for (e = 0; e < n.length; e += 16)i = l, a = g, d = v, h = m, g = f(g = f(g = f(g = f(g = c(g = c(g = c(g = c(g = u(g = u(g = u(g = u(g = o(g = o(g = o(g = o(g, v = o(v, m = o(m, l = o(l, g, v, m, n[e], 7, -680876936), g, v, n[e + 1], 12, -389564586), l, g, n[e + 2], 17, 606105819), m, l, n[e + 3], 22, -1044525330), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 4], 7, -176418897), g, v, n[e + 5], 12, 1200080426), l, g, n[e + 6], 17, -1473231341), m, l, n[e + 7], 22, -45705983), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 8], 7, 1770035416), g, v, n[e + 9], 12, -1958414417), l, g, n[e + 10], 17, -42063), m, l, n[e + 11], 22, -1990404162), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 12], 7, 1804603682), g, v, n[e + 13], 12, -40341101), l, g, n[e + 14], 17, -1502002290), m, l, n[e + 15], 22, 1236535329), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 1], 5, -165796510), g, v, n[e + 6], 9, -1069501632), l, g, n[e + 11], 14, 643717713), m, l, n[e], 20, -373897302), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 5], 5, -701558691), g, v, n[e + 10], 9, 38016083), l, g, n[e + 15], 14, -660478335), m, l, n[e + 4], 20, -405537848), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 9], 5, 568446438), g, v, n[e + 14], 9, -1019803690), l, g, n[e + 3], 14, -187363961), m, l, n[e + 8], 20, 1163531501), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 13], 5, -1444681467), g, v, n[e + 2], 9, -51403784), l, g, n[e + 7], 14, 1735328473), m, l, n[e + 12], 20, -1926607734), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 5], 4, -378558), g, v, n[e + 8], 11, -2022574463), l, g, n[e + 11], 16, 1839030562), m, l, n[e + 14], 23, -35309556), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 1], 4, -1530992060), g, v, n[e + 4], 11, 1272893353), l, g, n[e + 7], 16, -155497632), m, l, n[e + 10], 23, -1094730640), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 13], 4, 681279174), g, v, n[e], 11, -358537222), l, g, n[e + 3], 16, -722521979), m, l, n[e + 6], 23, 76029189), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 9], 4, -640364487), g, v, n[e + 12], 11, -421815835), l, g, n[e + 15], 16, 530742520), m, l, n[e + 2], 23, -995338651), v = f(v, m = f(m, l = f(l, g, v, m, n[e], 6, -198630844), g, v, n[e + 7], 10, 1126891415), l, g, n[e + 14], 15, -1416354905), m, l, n[e + 5], 21, -57434055), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 12], 6, 1700485571), g, v, n[e + 3], 10, -1894986606), l, g, n[e + 10], 15, -1051523), m, l, n[e + 1], 21, -2054922799), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 8], 6, 1873313359), g, v, n[e + 15], 10, -30611744), l, g, n[e + 6], 15, -1560198380), m, l, n[e + 13], 21, 1309151649), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 4], 6, -145523070), g, v, n[e + 11], 10, -1120210379), l, g, n[e + 2], 15, 718787259), m, l, n[e + 9], 21, -343485551), l = t(l, i), g = t(g, a), v = t(v, d), m = t(m, h); return [l, g, v, m] } function a(n) { var t, r = "", e = 32 * n.length; for (t = 0; t < e; t += 8)r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255); return r } function d(n) { var t, r = []; for (r[(n.length >> 2) - 1] = void 0, t = 0; t < r.length; t += 1)r[t] = 0; var e = 8 * n.length; for (t = 0; t < e; t += 8)r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32; return r } function h(n) { return a(i(d(n), 8 * n.length)) } function l(n, t) { var r, e, o = d(n), u = [], c = []; for (u[15] = c[15] = void 0, o.length > 16 && (o = i(o, 8 * n.length)), r = 0; r < 16; r += 1)u[r] = 909522486 ^ o[r], c[r] = 1549556828 ^ o[r]; return e = i(u.concat(d(t)), 512 + 8 * t.length), a(i(c.concat(e), 640)) } function g(n) { var t, r, e = ""; for (r = 0; r < n.length; r += 1)t = n.charCodeAt(r), e += "0123456789abcdef".charAt(t >>> 4 & 15) + "0123456789abcdef".charAt(15 & t); return e } function v(n) { return unescape(encodeURIComponent(n)) } function m(n) { return h(v(n)) } function p(n) { return g(m(n)) } function s(n, t) { return l(v(n), v(t)) } function C(n, t) { return g(s(n, t)) } function A(n, t, r) { return t ? r ? s(t, n) : C(t, n) : r ? m(n) : p(n) } $.md5 = A }(this);
function Env(t, e) {
  "undefined" != typeof process &&
    JSON.stringify(process.env).indexOf("GITHUB") > -1 &&
    process.exit(0);
  class s {
    constructor(t) {
      this.env = t;
    }
    send(t, e = "GET") {
      t = "string" == typeof t ? { url: t } : t;
      let s = this.get;
      return (
        "POST" === e && (s = this.post),
        new Promise((e, i) => {
          s.call(this, t, (t, s, r) => {
            t ? i(t) : e(s);
          });
        })
      );
    }
    get(t) {
      return this.send.call(this.env, t);
    }
    post(t) {
      return this.send.call(this.env, t, "POST");
    }
  }
  return new (class {
    constructor(t, e) {
      (this.name = t),
        (this.http = new s(this)),
        (this.data = null),
        (this.dataFile = "box.dat"),
        (this.logs = []),
        (this.isMute = !1),
        (this.isNeedRewrite = !1),
        (this.logSeparator = "\n"),
        (this.startTime = new Date().getTime()),
        Object.assign(this, e),
        this.log("", `🔔${this.name}, 开始!`);
    }
    isNode() {
      return "undefined" != typeof module && !!module.exports;
    }
    isQuanX() {
      return "undefined" != typeof $task;
    }
    isSurge() {
      return "undefined" != typeof $httpClient && "undefined" == typeof $loon;
    }
    isLoon() {
      return "undefined" != typeof $loon;
    }
    toObj(t, e = null) {
      try {
        return JSON.parse(t);
      } catch {
        return e;
      }
    }
    toStr(t, e = null) {
      try {
        return JSON.stringify(t);
      } catch {
        return e;
      }
    }
    getjson(t, e) {
      let s = e;
      const i = this.getdata(t);
      if (i)
        try {
          s = JSON.parse(this.getdata(t));
        } catch {}
      return s;
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e);
      } catch {
        return !1;
      }
    }
    getScript(t) {
      return new Promise((e) => {
        this.get({ url: t }, (t, s, i) => e(i));
      });
    }
    runScript(t, e) {
      return new Promise((s) => {
        let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        i = i ? i.replace(/\n/g, "").trim() : i;
        let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        (r = r ? 1 * r : 20), (r = e && e.timeout ? e.timeout : r);
        const [o, h] = i.split("@"),
          n = {
            url: `http://${h}/v1/scripting/evaluate`,
            body: { script_text: t, mock_type: "cron", timeout: r },
            headers: { "X-Key": o, Accept: "*/*" },
          };
        this.post(n, (t, e, i) => s(i));
      }).catch((t) => this.logErr(t));
    }
    loaddata() {
      if (!this.isNode()) return {};
      {
        (this.fs = this.fs ? this.fs : require("fs")),
          (this.path = this.path ? this.path : require("path"));
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e);
        if (!s && !i) return {};
        {
          const i = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(i));
          } catch (t) {
            return {};
          }
        }
      }
    }
    writedata() {
      if (this.isNode()) {
        (this.fs = this.fs ? this.fs : require("fs")),
          (this.path = this.path ? this.path : require("path"));
        const t = this.path.resolve(this.dataFile),
          e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t),
          i = !s && this.fs.existsSync(e),
          r = JSON.stringify(this.data);
        s
          ? this.fs.writeFileSync(t, r)
          : i
          ? this.fs.writeFileSync(e, r)
          : this.fs.writeFileSync(t, r);
      }
    }
    lodash_get(t, e, s) {
      const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let r = t;
      for (const t of i) if (((r = Object(r)[t]), void 0 === r)) return s;
      return r;
    }
    lodash_set(t, e, s) {
      return Object(t) !== t
        ? t
        : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []),
          (e
            .slice(0, -1)
            .reduce(
              (t, s, i) =>
                Object(t[s]) === t[s]
                  ? t[s]
                  : (t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}),
              t
            )[e[e.length - 1]] = s),
          t);
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
          r = s ? this.getval(s) : "";
        if (r)
          try {
            const t = JSON.parse(r);
            e = t ? this.lodash_get(t, i, "") : e;
          } catch (t) {
            e = "";
          }
      }
      return e;
    }
    setdata(t, e) {
      let s = !1;
      if (/^@/.test(e)) {
        const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
          o = this.getval(i),
          h = i ? ("null" === o ? null : o || "{}") : "{}";
        try {
          const e = JSON.parse(h);
          this.lodash_set(e, r, t), (s = this.setval(JSON.stringify(e), i));
        } catch (e) {
          const o = {};
          this.lodash_set(o, r, t), (s = this.setval(JSON.stringify(o), i));
        }
      } else s = this.setval(t, e);
      return s;
    }
    getval(t) {
      return this.isSurge() || this.isLoon()
        ? $persistentStore.read(t)
        : this.isQuanX()
        ? $prefs.valueForKey(t)
        : this.isNode()
        ? ((this.data = this.loaddata()), this.data[t])
        : (this.data && this.data[t]) || null;
    }
    setval(t, e) {
      return this.isSurge() || this.isLoon()
        ? $persistentStore.write(t, e)
        : this.isQuanX()
        ? $prefs.setValueForKey(t, e)
        : this.isNode()
        ? ((this.data = this.loaddata()),
          (this.data[e] = t),
          this.writedata(),
          !0)
        : (this.data && this.data[e]) || null;
    }
    initGotEnv(t) {
      (this.got = this.got ? this.got : require("got")),
        (this.cktough = this.cktough ? this.cktough : require("tough-cookie")),
        (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()),
        t &&
          ((t.headers = t.headers ? t.headers : {}),
          void 0 === t.headers.Cookie &&
            void 0 === t.cookieJar &&
            (t.cookieJar = this.ckjar));
    }
    get(t, e = () => {}) {
      t.headers &&
        (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
        this.isSurge() || this.isLoon()
          ? (this.isSurge() &&
              this.isNeedRewrite &&
              ((t.headers = t.headers || {}),
              Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })),
            $httpClient.get(t, (t, s, i) => {
              !t && s && ((s.body = i), (s.statusCode = s.status)), e(t, s, i);
            }))
          : this.isQuanX()
          ? (this.isNeedRewrite &&
              ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })),
            $task.fetch(t).then(
              (t) => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o);
              },
              (t) => e(t)
            ))
          : this.isNode() &&
            (this.initGotEnv(t),
            this.got(t)
              .on("redirect", (t, e) => {
                try {
                  if (t.headers["set-cookie"]) {
                    const s = t.headers["set-cookie"]
                      .map(this.cktough.Cookie.parse)
                      .toString();
                    s && this.ckjar.setCookieSync(s, null),
                      (e.cookieJar = this.ckjar);
                  }
                } catch (t) {
                  this.logErr(t);
                }
              })
              .then(
                (t) => {
                  const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o,
                  } = t;
                  e(null, { status: s, statusCode: i, headers: r, body: o }, o);
                },
                (t) => {
                  const { message: s, response: i } = t;
                  e(s, i, i && i.body);
                }
              ));
    }
    post(t, e = () => {}) {
      if (
        (t.body &&
          t.headers &&
          !t.headers["Content-Type"] &&
          (t.headers["Content-Type"] = "application/x-www-form-urlencoded"),
        t.headers && delete t.headers["Content-Length"],
        this.isSurge() || this.isLoon())
      )
        this.isSurge() &&
          this.isNeedRewrite &&
          ((t.headers = t.headers || {}),
          Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })),
          $httpClient.post(t, (t, s, i) => {
            !t && s && ((s.body = i), (s.statusCode = s.status)), e(t, s, i);
          });
      else if (this.isQuanX())
        (t.method = "POST"),
          this.isNeedRewrite &&
            ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })),
          $task.fetch(t).then(
            (t) => {
              const { statusCode: s, statusCode: i, headers: r, body: o } = t;
              e(null, { status: s, statusCode: i, headers: r, body: o }, o);
            },
            (t) => e(t)
          );
      else if (this.isNode()) {
        this.initGotEnv(t);
        const { url: s, ...i } = t;
        this.got.post(s, i).then(
          (t) => {
            const { statusCode: s, statusCode: i, headers: r, body: o } = t;
            e(null, { status: s, statusCode: i, headers: r, body: o }, o);
          },
          (t) => {
            const { message: s, response: i } = t;
            e(s, i, i && i.body);
          }
        );
      }
    }
    time(t, e = null) {
      const s = e ? new Date(e) : new Date();
      let i = {
        "M+": s.getMonth() + 1,
        "d+": s.getDate(),
        "H+": s.getHours(),
        "m+": s.getMinutes(),
        "s+": s.getSeconds(),
        "q+": Math.floor((s.getMonth() + 3) / 3),
        S: s.getMilliseconds(),
      };
      /(y+)/.test(t) &&
        (t = t.replace(
          RegExp.$1,
          (s.getFullYear() + "").substr(4 - RegExp.$1.length)
        ));
      for (let e in i)
        new RegExp("(" + e + ")").test(t) &&
          (t = t.replace(
            RegExp.$1,
            1 == RegExp.$1.length
              ? i[e]
              : ("00" + i[e]).substr(("" + i[e]).length)
          ));
      return t;
    }
    msg(e = t, s = "", i = "", r) {
      const o = (t) => {
        if (!t) return t;
        if ("string" == typeof t)
          return this.isLoon()
            ? t
            : this.isQuanX()
            ? { "open-url": t }
            : this.isSurge()
            ? { url: t }
            : void 0;
        if ("object" == typeof t) {
          if (this.isLoon()) {
            let e = t.openUrl || t.url || t["open-url"],
              s = t.mediaUrl || t["media-url"];
            return { openUrl: e, mediaUrl: s };
          }
          if (this.isQuanX()) {
            let e = t["open-url"] || t.url || t.openUrl,
              s = t["media-url"] || t.mediaUrl;
            return { "open-url": e, "media-url": s };
          }
          if (this.isSurge()) {
            let e = t.url || t.openUrl || t["open-url"];
            return { url: e };
          }
        }
      };
      if (
        (this.isMute ||
          (this.isSurge() || this.isLoon()
            ? $notification.post(e, s, i, o(r))
            : this.isQuanX() && $notify(e, s, i, o(r))),
        !this.isMuteLog)
      ) {
        let t = ["", "==============📣系统通知📣=============="];
        t.push(e),
          s && t.push(s),
          i && t.push(i),
          console.log(t.join("\n")),
          (this.logs = this.logs.concat(t));
      }
    }
    log(...t) {
      t.length > 0 && (this.logs = [...this.logs, ...t]),
        console.log(t.join(this.logSeparator));
    }
    logErr(t, e) {
      const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      s
        ? this.log("", `❗️${this.name}, 错误!`, t.stack)
        : this.log("", `❗️${this.name}, 错误!`, t);
    }
    wait(t) {
      return new Promise((e) => setTimeout(e, t));
    }
    done(t = {}) {
      const e = new Date().getTime(),
        s = (e - this.startTime) / 1e3;
      this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
        this.log(),
        (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t);
    }
  })(t, e);
}
