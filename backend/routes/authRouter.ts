import { Router } from "express";
import { CreateUserType, SigIn } from "../types/type";
import { sendEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken"
import { TOTP } from "totp-generator"
import base32 from "hi-base32"
import { prisma } from "../utils/prismaClient";

const router = Router()

//Rate limit here
router.post("/initialize_sigin", async (req, res) => {
    try {
        const { success, data } = CreateUserType.safeParse(req.body)

        if (!success) {
            res.status(411).json({
                message: "Incorrect Inputs",
            })
            return
        }

        //Generate and Send OTP
        const { otp, expires } = TOTP.generate(base32.encode(data.email + process.env.JWT_SECRET!))
        if (process.env.NODE_ENV! !== "development") {
            await sendEmail(data.email, "Welcome to AurAI", otp)
        } else {
            console.log("Log in to AurAI", otp);
        }

        try {
            await prisma.user.create({
                data: {
                    email: data.email,
                }
            })
            res.status(200).json({
                message: "Email sent successfully",
                success: true,
            })
        } catch (error) {
            console.log("User already exists", error);
            res.status(500).json({
                message: "User already exists",
                success: false,
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
        })
    }
});

router.post("/sigin", async (req, res) => {
    const { success, data } = SigIn.safeParse(req.body)

    if (!success) {
        res.status(411).json({
            message: "Incorrect Inputs"
        })
        return
    }

    //Verify OTP
    const { otp } = TOTP.generate(base32.encode(data.email + process.env.JWT_SECRET!))

    if (otp !== data.otp) {
        console.log(otp, data.otp);

        res.status(411).json({
            message: "Incorrect OTP",
            success: false
        })
        return
    }

    const user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    })

    if (!user) {
        res.status(404).json({
            message: "User not found",
            success: false
        })
        return
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!)

    res.status(200).json({
        token,
        success: true
    })
})

export default router