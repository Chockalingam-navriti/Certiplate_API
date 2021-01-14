"use strict";

var express = require("express");

var router = express.Router();

var dotenv = require("dotenv");

var bodyparser = require("body-parser");

var multer = require("multer");

var db = require("../DB_Connection/pg_connect");

var jwt = require("jsonwebtoken");

var passport = require("passport");

var JwtStrategy = require("passport-jwt").Strategy;

var _require = require("../Settings/log"),
    log_info = _require.log_info,
    log_error = _require.log_error;

var upload = multer();

var cookieparser = require("cookie-parser");

var fs = require("fs");

var apikey = "'" + process.env.apikey + "'";
var reqData;
dotenv.config();
router.use(bodyparser.json());
router.use(bodyparser.urlencoded({
  extended: false
}));
router.use(upload.array());
router.use(cookieparser());
var opts = {};

opts.jwtFromRequest = function (req) {
  var token = null;

  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }

  return token;
};

opts.secretOrKey = fs.readFileSync("./RSA/rsa.public");
router.use(function (req, res, next) {
  reqData = Object.keys(req.query).length !== 0 ? req.query : req.body;
  next();
});
passport.use(new JwtStrategy(opts, function _callee(payload, done) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("JWT based authentication");

          if (!payload.data.AuthenticationResponseData.UserId) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", done(null, payload));

        case 5:
          return _context.abrupt("return", done(new Error("Unauthorized"), null));

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}));
router.use(passport.initialize()); //Login API

router.post("/GetAuthenticationResponseDataRequest", function (req, res) {
  var response = {
    AuthenticationResponseData: {
      StatusId: 0,
      Message: null,
      UserId: 0,
      UserName: "",
      Email: "",
      AccountStatus: 0,
      EmailActivationStatus: 0,
      UserRoleId: 0,
      UserRoleName: "",
      SessionId: ""
    }
  };

  if (!reqData.ApiKey || reqData.ApiKey != apikey) {
    log_info("Started", "GetAuthenticationResponseDataRequest", reqData.UserId);
    response.AuthenticationResponseData.StatusId = -1;
    response.AuthenticationResponseData.Message = "Unauthorized API Request!";
    log_info("Ended", "GetAuthenticationResponseDataRequest", reqData.UserId);
    log_info("Unauthorized", "GetAuthenticationResponseDataRequest", reqData.UserId);
    res.status(401).send(response);
    return;
  }

  if (!reqData.UserId || reqData.UserId < 0) {
    log_info("Started", "GetAuthenticationResponseDataRequest", reqData.UserId);
    response.AuthenticationResponseData.StatusId = -1;
    response.AuthenticationResponseData.Message = "Missing/Invalid UserId";
    log_info("Missing", "GetAuthenticationResponseDataRequest", reqData.UserId, "UserId");
    log_info("Ended", "GetAuthenticationResponseDataRequest", reqData.UserId);
    res.send(response);
    return;
  }

  if (!reqData.Password) {
    log_info("Started", "GetAuthenticationResponseDataRequest", reqData.UserId);
    response.AuthenticationResponseData.StatusId = -1;
    response.AuthenticationResponseData.Message = "Missing/Invalid Password";
    log_info("Missing", "GetAuthenticationResponseDataRequest", reqData.UserId, "Password");
    log_info("Ended", "GetAuthenticationResponseDataRequest", reqData.UserId);
    res.send(response);
    return;
  }

  if (!reqData.ClientIpAddress) {
    log_info("Started", "GetAuthenticationResponseDataRequest", reqData.UserId);
    response.AuthenticationResponseData.StatusId = -1;
    response.AuthenticationResponseData.Message = "Missing/Invalid ClientIpAddress";
    log_info("Ended", "GetAuthenticationResponseDataRequest", reqData.UserId);
    log_info("Missing", "GetAuthenticationResponseDataRequest", reqData.UserId, "ClientIpAddress");
    res.send(response);
    return;
  }

  if (!reqData.ClientBrowser) {
    log_info("Started", "GetAuthenticationResponseDataRequest", reqData.UserId);
    response.AuthenticationResponseData.StatusId = -1;
    response.AuthenticationResponseData.Message = "Missing/Invalid ClientBrowser";
    log_info("Ended", "GetAuthenticationResponseDataRequest", reqData.UserId);
    log_info("Missing", "GetAuthenticationResponseDataRequest", reqData.UserId, "ClientBrowser");
    res.send(response);
    return;
  }

  try {
    log_info("Started", "GetAuthenticationResponseDataRequest", reqData.UserId); //throw new Error('error');

    var connection = new db();
    var query = "SELECT * from users.fn_get_authentication_response_data(".concat(reqData.UserId, ",").concat(reqData.Password, ",").concat(reqData.ClientIpAddress, ",").concat(reqData.ClientBrowser, ")");
    connection.Query_Function(query, function (varlistData) {
      response.AuthenticationResponseData.StatusId = varlistData[0]["status_id"];
      response.AuthenticationResponseData.Message = varlistData[0]["message"];
      response.AuthenticationResponseData.UserId = varlistData[0]["user_id"];
      response.AuthenticationResponseData.UserName = varlistData[0]["user_name"];
      response.AuthenticationResponseData.Email = varlistData[0]["email"];
      response.AuthenticationResponseData.AccountStatus = varlistData[0]["account_status"];
      response.AuthenticationResponseData.EmailActivationStatus = varlistData[0]["email_active_status"];
      response.AuthenticationResponseData.UserRoleId = varlistData[0]["user_role_id"];
      response.AuthenticationResponseData.UserRoleName = varlistData[0]["user_role_name"];
      response.AuthenticationResponseData.SessionId = varlistData[0]["session_id"];

      if (varlistData[0]["message"] == "User authentication success") {
        var token = jwt.sign({
          data: response
        }, fs.readFileSync("./RSA/rsa.private"), {
          algorithm: "RS256",
          expiresIn: "1h"
        });
        res.cookie("jwt", token);
      }

      log_info("Ended", "GetAuthenticationResponseDataRequest", reqData.UserId);
      res.send(response);
    });
  } catch (err) {
    log_error("GetAuthenticationResponseDataRequest", err);
    log_info("Ended", "GetAuthenticationResponseDataRequest", reqData.UserId);
    res.status(500).send("Error");
  }
}); //Logout API

router.post("/GetLogoutResponseDataRequest", passport.authenticate("jwt", {
  session: false
}), function (req, res) {
  var response = {
    LogoutResponseData: {
      StatusId: 0,
      Message: null
    }
  };

  if (!reqData.UserId || reqData.UserId < 0) {
    log_info("Started", "GetLogoutResponseDataRequest", reqData.UserId);
    response.LogoutResponseData.StatusId = -1;
    response.LogoutResponseData.Message = "Missing/Invalid UserId";
    log_info("Missing", "GetLogoutResponseDataRequest", reqData.UserId, "UserId");
    log_info("Ended", "GetLogoutResponseDataRequest", reqData.UserId);
    res.send(response);
    return;
  }

  if (req.user.data.AuthenticationResponseData.UserId == reqData.UserId) {
    if (!reqData.ApiKey || reqData.ApiKey != apikey) {
      log_info("Started", "GetLogoutResponseDataRequest", reqData.UserId);
      response.LogoutResponseData.StatusId = -1;
      response.LogoutResponseData.Message = "Unauthorized API Request!";
      log_info("Ended", "GetLogoutResponseDataRequest", reqData.UserId);
      log_info("Unauthorized", "GetLogoutResponseDataRequest", reqData.UserId);
      res.status(401).send(response);
      return;
    }

    if (!reqData.SessionId || reqData.SessionId < 0) {
      log_info("Started", "GetLogoutResponseDataRequest", reqData.SessionId);
      response.LogoutResponseData.StatusId = -1;
      response.LogoutResponseData.Message = "Missing/Invalid SessionId";
      log_info("Missing", "GetLogoutResponseDataRequest", reqData.SessionId, "SessionId");
      log_info("Ended", "GetLogoutResponseDataRequest", reqData.SessionId);
      res.send(response);
      return;
    }

    try {
      log_info("Started", "GetLogoutResponseDataRequest", reqData.UserId); //throw new Error('error');

      var connection = new db();
      var query = "SELECT * from users.fn_get_logout_response_data(".concat(reqData.UserId, ",").concat(reqData.SessionId, ")");
      connection.Query_Function(query, function (varlistData) {
        response.LogoutResponseData.StatusId = varlistData[0]["status_id"];
        response.LogoutResponseData.Message = varlistData[0]["message"];
        log_info("Ended", "GetLogoutResponseDataRequest", reqData.UserId);
        res.clearCookie("jwt");
        res.send(response);
      });
    } catch (err) {
      log_error("GetLogoutResponseDataRequest", err);
      log_info("Ended", "GetLogoutResponseDataRequest", reqData.UserId);
      res.status(500).send("Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
}); //Change Password API

router.post("/ChangeUserPasswordRequest", passport.authenticate("jwt", {
  session: false
}), function (req, res) {
  var response = {
    ChangeUserPasswordData: {
      StatusId: 0,
      Message: null
    }
  };

  if (!reqData.UserId || reqData.UserId < 0) {
    log_info("Started", "ChangeUserPasswordRequest", reqData.UserId);
    response.ChangeUserPasswordData.StatusId = -1;
    response.ChangeUserPasswordData.Message = "Missing/Invalid UserId";
    log_info("Missing", "ChangeUserPasswordRequest", reqData.UserId, "UserId");
    log_info("Ended", "ChangeUserPasswordRequest", reqData.UserId);
    res.send(response);
    return;
  }

  if (req.user.data.AuthenticationResponseData.UserId == reqData.UserId) {
    if (!reqData.ApiKey || reqData.ApiKey != apikey) {
      log_info("Started", "ChangeUserPasswordRequest", reqData.UserId);
      response.ChangeUserPasswordData.StatusId = -1;
      response.ChangeUserPasswordData.Message = "Unauthorized API Request!";
      log_info("Ended", "ChangeUserPasswordRequest", reqData.UserId);
      log_info("Unauthorized", "ChangeUserPasswordRequest", reqData.UserId);
      res.status(401).send(response);
      return;
    }

    if (!reqData.OldPassword || reqData.OldPassword < 0) {
      log_info("Started", "ChangeUserPasswordRequest", reqData.OldPassword);
      response.ChangeUserPasswordData.StatusId = -1;
      response.ChangeUserPasswordData.Message = "Missing/Invalid OldPassword";
      log_info("Missing", "ChangeUserPasswordRequest", reqData.OldPassword, "OldPassword");
      log_info("Ended", "ChangeUserPasswordRequest", reqData.OldPassword);
      res.send(response);
      return;
    }

    if (!reqData.NewPassword || reqData.NewPassword < 0) {
      log_info("Started", "ChangeUserPasswordRequest", reqData.NewPassword);
      response.ChangeUserPasswordData.StatusId = -1;
      response.ChangeUserPasswordData.Message = "Missing/Invalid NewPassword";
      log_info("Missing", "ChangeUserPasswordRequest", reqData.NewPassword, "NewPassword");
      log_info("Ended", "ChangeUserPasswordRequest", reqData.NewPassword);
      res.send(response);
      return;
    }

    try {
      log_info("Started", "ChangeUserPasswordRequest", reqData.UserId); //throw new Error('error');

      var connection = new db();
      var query = "SELECT * from users.fn_change_user_password(".concat(reqData.UserId, ",").concat(reqData.OldPassword, ",").concat(reqData.NewPassword, ")");
      connection.Query_Function(query, function (varlistData) {
        response.ChangeUserPasswordData.StatusId = varlistData[0]["status_id"];
        response.ChangeUserPasswordData.Message = varlistData[0]["message"];
        log_info("Ended", "ChangeUserPasswordRequest", reqData.UserId);
        res.send(response);
      });
    } catch (err) {
      log_error("ChangeUserPasswordRequest", err);
      log_info("Ended", "ChangeUserPasswordRequest", reqData.UserId);
      res.status(500).send("Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
}); //Reset Password API

router.post("/GetResetPasswordResponseDataRequest", passport.authenticate("jwt", {
  session: false
}), function (req, res) {
  var response = {
    ResetPasswordResponseData: {
      StatusId: 0,
      Message: null
    }
  };

  if (!reqData.UserId || reqData.UserId < 0) {
    log_info("Started", "GetResetPasswordResponseDataRequest", reqData.UserId);
    response.ResetPasswordResponseData.StatusId = -1;
    response.ResetPasswordResponseData.Message = "Missing/Invalid UserId";
    log_info("Missing", "GetResetPasswordResponseDataRequest", reqData.UserId, "UserId");
    log_info("Ended", "GetResetPasswordResponseDataRequest", reqData.UserId);
    res.send(response);
    return;
  }

  if (req.user.data.AuthenticationResponseData.UserId == reqData.UserId) {
    if (!reqData.ApiKey || reqData.ApiKey != apikey) {
      log_info("Started", "GetResetPasswordResponseDataRequest", reqData.UserId);
      response.ResetPasswordResponseData.StatusId = -1;
      response.ResetPasswordResponseData.Message = "Unauthorized API Request!";
      log_info("Ended", "GetResetPasswordResponseDataRequest", reqData.UserId);
      log_info("Unauthorized", "GetResetPasswordResponseDataRequest", reqData.UserId);
      res.status(401).send(response);
      return;
    }

    if (!reqData.Password || reqData.Password < 0) {
      log_info("Started", "GetResetPasswordResponseDataRequest", reqData.Password);
      response.ResetPasswordResponseData.StatusId = -1;
      response.ResetPasswordResponseData.Message = "Missing/Invalid Password";
      log_info("Missing", "GetResetPasswordResponseDataRequest", reqData.Password, "Password");
      log_info("Ended", "GetResetPasswordResponseDataRequest", reqData.Password);
      res.send(response);
      return;
    }

    try {
      log_info("Started", "GetResetPasswordResponseDataRequest", reqData.UserId); //throw new Error('error');

      var connection = new db();
      var query = "SELECT * from users.fn_get_reset_password_response_data(".concat(reqData.UserId, ",").concat(reqData.Password, ")");
      connection.Query_Function(query, function (varlistData) {
        response.ResetPasswordResponseData.StatusId = varlistData[0]["status_id"];
        response.ResetPasswordResponseData.Message = varlistData[0]["message"];
        log_info("Ended", "GetResetPasswordResponseDataRequest", reqData.UserId);
        res.send(response);
      });
    } catch (err) {
      log_error("GetResetPasswordResponseDataRequest", err);
      log_info("Ended", "GetResetPasswordResponseDataRequest", reqData.UserId);
      res.status(500).send("Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
}); //Sectorwise Assessor Details API

router.post("/GetSectorwiseAssessorCertificationStatusCountDataRequest", passport.authenticate("jwt", {
  session: false
}), function (req, res) {
  var response = {
    SectorwiseAssessorCertificationStatusCountData: {
      StatusId: 0,
      Message: null,
      CertificationStatusData: []
    }
  };

  if (!reqData.UserId || reqData.UserId < 0) {
    log_info("Started", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId);
    response.SectorwiseAssessorCertificationStatusCountData.StatusId = -1;
    response.SectorwiseAssessorCertificationStatusCountData.Message = "Missing/Invalid UserId";
    log_info("Missing", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId, "UserId");
    log_info("Ended", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId);
    res.send(response);
    return;
  }

  if (req.user.data.AuthenticationResponseData.UserId == reqData.UserId) {
    if (!reqData.ApiKey || reqData.ApiKey != apikey) {
      log_info("Started", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId);
      response.SectorwiseAssessorCertificationStatusCountData.StatusId = -1;
      response.SectorwiseAssessorCertificationStatusCountData.Message = "Unauthorized API Request!";
      log_info("Ended", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId);
      log_info("Unauthorized", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId);
      res.status(401).send(response);
      return;
    }

    if (!reqData.UserRoleId || reqData.UserRoleId < 0) {
      log_info("Started", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserRoleId);
      response.SectorwiseAssessorCertificationStatusCountData.StatusId = -1;
      response.SectorwiseAssessorCertificationStatusCountData.Message = "Missing/Invalid UserRoleId";
      log_info("Missing", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserRoleId, "UserRoleId");
      log_info("Ended", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserRoleId);
      res.send(response);
      return;
    }

    try {
      log_info("Started", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId); //throw new Error('error');

      var connection = new db();
      var query = "SELECT * from users.fn_get_sectorwise_assessor_certification_status_count_data(".concat(reqData.UserId, ",").concat(reqData.UserRoleId, ")");
      connection.Query_Function(query, function (varlistData) {
        response.SectorwiseAssessorCertificationStatusCountData.StatusId = 1;
        response.SectorwiseAssessorCertificationStatusCountData.Message = "Success";
        varlistData.forEach(function (element) {
          response.SectorwiseAssessorCertificationStatusCountData.CertificationStatusData.push({
            SectorId: parseInt(element["sector_id"]),
            SectorName: element["sector_name"],
            GovernmentLeadCount: parseInt(element["government_lead_count"]),
            GovernmentApprovedCount: parseInt(element["government_approved_count"]),
            GovernmentCertifiedCount: parseInt(element["government_certified_count"]),
            GovernmentExpiredCount: parseInt(element["government_expired_count"]),
            GovernmentTotalCount: parseInt(element["government_total_count"]),
            GovernmentDistinctTotalCount: parseInt(element["government_distinct_total_count"]),
            InstitutionLeadCount: parseInt(element["institution_lead_count"]),
            InstitutionApprovedCount: parseInt(element["institution_approved_count"]),
            InstitutionCertifiedCount: parseInt(element["institution_certified_count"]),
            InstitutionTotalCount: parseInt(element["institution_total_count"]),
            InstitutionDistinctTotalCount: parseInt(element["institution_distinct_total_count"]),
            TotalCount: parseInt(element["total_count"]),
            DistinctTotalCount: parseInt(element["distinct_total_count"])
          });
        });
        log_info("Ended", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId);
        res.send(response);
      });
    } catch (err) {
      log_error("GetSectorwiseAssessorCertificationStatusCountDataRequest", err);
      log_info("Ended", "GetSectorwiseAssessorCertificationStatusCountDataRequest", reqData.UserId);
      res.status(500).send("Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
}); //Statewise Assessor Details API

router.post("/GetStatewiseAssessorCountDataRequest", passport.authenticate("jwt", {
  session: false
}), function (req, res) {
  var response = {
    StatewiseAssessorCountData: {
      StatusId: 1,
      Message: "Success",
      StatewiseAssessorData: []
    }
  };

  if (!reqData.UserId || reqData.UserId < 0) {
    log_info("Started", "GetStatewiseAssessorCountDataRequest", reqData.UserId);
    response.StatewiseAssessorCountData.StatusId = -1;
    response.StatewiseAssessorCountData.Message = "Missing/Invalid UserId";
    log_info("Missing", "GetStatewiseAssessorCountDataRequest", reqData.UserId, "UserId");
    log_info("Ended", "GetStatewiseAssessorCountDataRequest", reqData.UserId);
    res.send(response);
    return;
  }

  if (req.user.data.AuthenticationResponseData.UserId == reqData.UserId) {
    if (!reqData.ApiKey || reqData.ApiKey != apikey) {
      log_info("Started", "GetStatewiseAssessorCountDataRequest", reqData.UserId);
      response.StatewiseAssessorCountData.StatusId = -1;
      response.StatewiseAssessorCountData.Message = "Unauthorized API Request!";
      log_info("Ended", "GetStatewiseAssessorCountDataRequest", reqData.UserId);
      log_info("Unauthorized", "GetStatewiseAssessorCountDataRequest", reqData.UserId);
      res.status(401).send(response);
      return;
    }

    if (!reqData.UserRoleId || reqData.UserRoleId < 0) {
      log_info("Started", "GetStatewiseAssessorCountDataRequest", reqData.UserRoleId);
      response.StatewiseAssessorCountData.StatusId = -1;
      response.StatewiseAssessorCountData.Message = "Missing/Invalid UserRoleId";
      log_info("Missing", "GetStatewiseAssessorCountDataRequest", reqData.UserRoleId, "UserRoleId");
      log_info("Ended", "GetStatewiseAssessorCountDataRequest", reqData.UserRoleId);
      res.send(response);
      return;
    }

    if (!reqData.SectorId || reqData.SectorId < 0) {
      log_info("Started", "GetStatewiseAssessorCountDataRequest", reqData.SectorId);
      response.StatewiseAssessorCountData.StatusId = -1;
      response.StatewiseAssessorCountData.Message = "Missing/Invalid SectorId";
      log_info("Missing", "GetStatewiseAssessorCountDataRequest", reqData.SectorId, "SectorId");
      log_info("Ended", "GetStatewiseAssessorCountDataRequest", reqData.SectorId);
      res.send(response);
      return;
    }

    if (!reqData.SearchType || reqData.SearchType < 0) {
      log_info("Started", "GetStatewiseAssessorCountDataRequest", reqData.SearchType);
      response.StatewiseAssessorCountData.StatusId = -1;
      response.StatewiseAssessorCountData.Message = "Missing/Invalid SearchType";
      log_info("Missing", "GetStatewiseAssessorCountDataRequest", reqData.SearchType, "SearchType");
      log_info("Ended", "GetStatewiseAssessorCountDataRequest", reqData.SearchType);
      res.send(response);
      return;
    }

    try {
      log_info("Started", "GetStatewiseAssessorCountDataRequest", reqData.UserId); //throw new Error('error');

      var connection = new db();
      var query;

      if (reqData.QualificationPackId) {
        query = "SELECT * from users.fn_get_statewise_assessor_certification_data(".concat(reqData.SectorId, ",").concat(reqData.QualificationPackId, ",").concat(reqData.UserId, ",").concat(reqData.UserRoleId, ")");
      } else {
        query = "SELECT * from users.fn_get_statewise_assessor_certification_data(".concat(reqData.SectorId, ",0,").concat(reqData.UserId, ",").concat(reqData.UserRoleId, ")");
      }

      connection.Query_Function(query, function (varlistData) {
        response.StatewiseAssessorCountData.StatusId = 1;
        response.StatewiseAssessorCountData.Message = "Success";
        varlistData.forEach(function (element) {
          response.StatewiseAssessorCountData.StatewiseAssessorData.push({
            StateId: parseInt(element["state_id"]),
            StateName: element["state_name"],
            AssessorCount: parseInt(element["distinct_total_count"])
          });
        });
        log_info("Ended", "GetStatewiseAssessorCountDataRequest", reqData.UserId);
        res.send(response);
      });
    } catch (err) {
      log_error("GetStatewiseAssessorCountDataRequest", err);
      log_info("Ended", "GetStatewiseAssessorCountDataRequest", reqData.UserId);
      res.status(500).send("Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});
module.exports = router;