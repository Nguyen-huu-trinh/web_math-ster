import {

auditRepository,

AuditDto

}

from "@/repositories/audit.repository";

export class AuditService{

    create(data:AuditDto){

        return auditRepository.create(data);

    }

    getAll(){

        return auditRepository.findAll();

    }

    getByUser(id:string){

        return auditRepository.findByUser(id);

    }

}

export const auditService=
new AuditService();