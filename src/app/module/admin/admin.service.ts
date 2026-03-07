import status from "http-status"
import AppError from "../../errorHelpers/AppError"
import { prisma } from "../../lib/prisma"
import { IUpdateAdminPayload } from "./admin.interface"
import { IRequestUser } from "../../interfaces/requestUser.interface"

import { UserStatus } from "../../../generated/prisma/enums"



const getAllAdmins = async () => {
    const admins = await prisma.admin.findMany({
        include:{
            user:true,
        }
    })
    return admins
}

const getAdminById = async (id: string) => {
    const admin = await prisma.admin.findUnique({
        where:{
            id,
        },
        include:{
            user:true
        }
    })
    return admin
}

const updateAdmin = async (id: string, payload:IUpdateAdminPayload) => {
    //TODO: Validate who is updating the admin user. Only super admin can update admin user and only supper admin can update supper admin user but admin user cannot update super admin user

    const isAdminExist = await prisma.admin.findUnique({
        where:{
            id
        }
    })

    if(!isAdminExist) {
        throw new AppError(status.NOT_FOUND, 'Admin or Super Admin not found')
    }

    const {admin} = payload;

    const updateAdmin = await prisma.admin.update({
        where:{
            id,
        },
        data:{
            ...admin,
        }
    })
    return updateAdmin
}


// soft delete admin user by setting is deleted to true and also delete the user session and account
const deleteAdmin = async (id:string, user:IRequestUser) => {
     //TODO: Validate who is deleting the admin user. Only super admin can delete admin user and only super admin can delete super admin user but admin user cannot delete super admin user

     const isAdminExist = await prisma.admin.findUnique({
        where:{
            id,
        }
     })

     if(!isAdminExist){
        throw new AppError(status.NOT_FOUND, 'Admin or super admin not found')
     }

     if(isAdminExist.id === user.userId){
        throw new AppError(status.BAD_REQUEST, 'You cannot delete yourself')
     }

     const result = await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where:{id},
            data:{
                isDeleted:true,
                deletedAt: new Date()
            }
        })
        await tx.user.update({
            where:{id},
            data:{
                isDeleted:true,
                deletedAt: new Date(),
                status: UserStatus.DELETED // optional: you may want to block the user
            }
        })

        await tx.session.deleteMany({
            where:{userId: isAdminExist.userId}
        })

        await tx.account.deleteMany({
            where:{userId:isAdminExist.userId}
        })

        const admin = await getAdminById(id)

        return admin
     })

     return result
}


export const AdminService = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
}