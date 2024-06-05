import express from "express";
const counsellorRouter = express();

import { viewCounsellor,createCounsellor,deleteCounsellor,updateCounsellor,allCounsellors } from "../../controllers/counsellor.controllers.js";
import { validTokenAdmin } from "../../middleware/admin.auth.middleware.js";
import { validTokenUserNumber } from "../../middleware/auth.middleware.js";


counsellorRouter.route("/counsellors")
.get(validTokenUserNumber,allCounsellors)
.post(validTokenAdmin,createCounsellor)


counsellorRouter.route("/counsellors/:counsellorId")
.get(validTokenUserNumber,viewCounsellor)
.patch(validTokenAdmin,updateCounsellor)
.delete(validTokenAdmin,deleteCounsellor)






export {counsellorRouter}