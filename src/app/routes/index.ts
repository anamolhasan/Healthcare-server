import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRouters } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { AdminRoutes } from "../module/admin/admin.route";


const router = Router()

router.use('/auth', AuthRoutes)
router.use('/specialties', SpecialtyRoutes)
router.use('/users', UserRouters)
router.use('/doctors', DoctorRoutes)
router.use('/admins', AdminRoutes)



export const IndexRoutes = router