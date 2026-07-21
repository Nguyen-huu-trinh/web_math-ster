import { NextRequest } from "next/server";

import { studentService } from "@/services/student.service";

import {
  UpdateStudentSchema,
} from "@/validators/student.schema";

import { requireTeacher } from "@/lib/auth/teacher";

import {
  success,
} from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

interface Props {

    params: Promise<{

        id:string

    }>

}

export async function GET(
    request:NextRequest,
    {params}:Props
){

    try{

        await requireTeacher();

        const {id}=await params;

        return success(

            await studentService.getById(id)

        );

    }

    catch(error){

        return handleError(error);

    }

}

export async function PATCH(
    request:NextRequest,
    {params}:Props
){

    try{

        await requireTeacher();

        const body=
            await request.json();

        const values=
            UpdateStudentSchema.parse(body);

        const {id}=await params;

        return success(

            await studentService.update(
                id,
                values
            )

        );

    }

    catch(error){

        return handleError(error);

    }

}

export async function DELETE(
    request:NextRequest,
    {params}:Props
){

    try{

        await requireTeacher();

        const {id}=await params;

        return success(

            await studentService.remove(id)

        );

    }

    catch(error){

        return handleError(error);

    }

}