import jwt from "jsonwebtoken";
import { UserNumber } from "../models/auth/userNumber.js";
import { UserDetails } from "../models/userModels/userDetails.js";
import Subscription from "../models/Subscriptions/subscription.js";
import { formatError } from "../utils/response.js";

const validTokenUserNumber = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json(formatError("Unauthorized"));
    }
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    if (!verifyToken)
      return res.status(401).json(formatError("Invalid Json Token"));
    const userNumber = await UserNumber.findById(verifyToken.id);
    if (!userNumber) return res.status(401).json(formatError("Invalid User"));
    if (!userNumber.role) {
      req.role = null;
    } else {
      req.role = userNumber.role;
    }
    req.user = verifyToken.id;
    req.token = token;
    req.phone = userNumber.phone;
    next();
  } catch (e) {
    res.status(500).json(formatError(e.message));
  }
};

const validTokenUserDetail = async (req, res, next) => {
  try {
    const token = req.header("x-auth-user");
    if (!token) {
      return res.status(401).json(formatError("Unauthorized"));
    }
    const verifyToken = jwt.verify(token, "passwordKey");
    if (!verifyToken)
      return res.status(401).json(formatError("Invalid Json Token"));

    const userDetail = await UserDetails.findById(verifyToken.id);
    if (!userDetail) return res.status(401).json(formatError("Invalid User"));
    const subscription = await Subscription.findById(
      verifyToken.subscriptionId
    );
    if (!subscription)
      return res.status(401).json(formatError("Invalid Subscription Id"));

    req.user = verifyToken.id;
    req.token = token;
    req.role = verifyToken.role;
    req.tier = subscription.tier;
    req.subscription = verifyToken.subscriptionId;

    next();
  } catch (error) {
    res.status(500).json(formatError(error.message));
    console.log("middleware");
  }
};

export { validTokenUserNumber, validTokenUserDetail };
