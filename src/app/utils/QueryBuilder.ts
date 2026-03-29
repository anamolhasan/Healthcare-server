import { release } from "node:os";
import { IQueryConfig, IQueryParams, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate, PrismaStringFilter, PrismaWhereConditions } from "../interfaces/query.interface";


// T = Model Type
export class QueryBuilder<
T,
TWhereInput = Record<string, unknown>,
TInclude = Record<string, unknown>
>{
    private query : PrismaFindManyArgs;
    private countQuery : PrismaCountArgs;
    private page : number = 1;
    private limit : number = 10;
    private skip : number = 0;
    private sortBy : string = 'createdAt';
    private sortOrder : 'asc' | 'desc' = 'desc';
    private selectFields : Record<string, boolean> | undefined;


    constructor(
        private model: PrismaModelDelegate,
        private queryParams : IQueryParams,
        private config : IQueryConfig = {}
    ){
        this.query = {
            where:{},
            include: {},
            orderBy : {},
            skip: 0,
            take : 10,
        };

        this.countQuery = {
            where : {},
        }
    }


    search(): this {
        const {searchTerm} = this.queryParams;
        const {searchableFields} = this.config;
        // doctorSearchableFields = ['user.name', 'user.email', 'specialties.specialty.title', 'specialties.specialty.description']
        if(searchTerm && searchableFields && searchableFields.length > 0){
            const searchConditions : Record<string, unknown>[] = searchableFields.map((field) => {
                if(field.includes('.')){
                    const parts = field.split('.');

                    if(parts.length === 2){
                        const [relation, nestedField] = parts;
                        
                        const stringFilter : PrismaStringFilter = {
                            contains : searchTerm,
                            mode : 'insensitive' as const,
                        }

                        return {
                            [relation] : {
                                [nestedField] : stringFilter
                            }
                        }
                    }else if(parts.length === 3){
                        const [relation, nestedRelation, nestedField] = parts;

                        const stringFilter : PrismaStringFilter = {
                            contains: searchTerm,
                            mode: 'insensitive' as const
                        }

                        return {
                            [relation] : {
                                some : {
                                    [nestedRelation]: {
                                        [nestedField]: stringFilter
                                    }
                                }
                            }
                        }
                    }
                }

                //  direct field
                const stringFilter: PrismaStringFilter = {
                    contains: searchTerm,
                    mode: 'insensitive' as const,
                }
                return {
                    [field] : stringFilter
                }
            })

            const whereConditions = this.query.where as PrismaWhereConditions

            whereConditions.OR = searchConditions;

            const countWhereConditions = this.countQuery.where as PrismaWhereConditions;
            countWhereConditions.OR = searchConditions;
        }

        return this

    }

      // /doctors?searchTerm=john&page=1&sortBy=name&specialty=cardiology&appointmentFee[lt]=100 => {}
    // { specialty: 'cardiology', appointmentFee: { lt: '100' } }
    filter(): this {
        
        const {filterableFields} = this.config
        const excludedField = ['searchTerm', 'page', 'limit', 'sortOrder', 'fields', 'include'];

        const filterParams : Record<string, unknown> = {};

        Object.keys(this.queryParams).forEach((key) => {
            if(!excludedField.includes(key)){
                filterParams[key] = this.queryParams[key];
            }
        })

        const queryWhere = this.query.where as Record<string, unknown>;
        const countQueryWhere = this.countQuery.where as Record<string, unknown>;

        Object.keys(filterParams).forEach((key) => {
            const value = filterParams[key];

            if(value === undefined || value === ''){
                return;
            }

            const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);

            // doctorFilterableFields = ['specialties.specialty.title', 'appointmentFee']
            // /doctors?appointmentFee[lt]=100&appointmentFee[gt]=50 => { appointmentFee: { lt: '100', gt: '50' } }

            // /doctors?user.name=John => {user: {name: 'John'}}
            if(key.includes('.')){
                const parts = key.split('.');

                if(filterableFields && !filterableFields.includes(key)){
                    return;
                }


                if(parts.length === 2){
                    const [relation, nestedField] = parts;

                    if(!queryWhere[relation]){
                        queryWhere[relation] = {};
                        countQueryWhere[relation] = {};
                    }

                    const queryRelation = queryWhere[relation] as Record<string, unknown>;
                    const countRelation = countQueryWhere[relation] as Record<string, unknown>;

                    queryRelation[nestedField] = this.parseFilterValue(value);
                    countRelation[nestedField] = this.parseFilterValue(value);
                    return;
                }
                else if(parts.length === 3){
                    const [relation, nestedRelation] = parts

                    if(!queryWhere[relation]){
                        queryWhere[relation] = {
                            some:{}
                        };
                        countQueryWhere[relation] = {
                            some:{}
                        }
                    }

                    const queryRelation = queryWhere[relation] as Record<string, unknown>;
                    const countRelation = queryWhere[relation] as Record<string, unknown>;

                    if(!queryRelation.some){
                        queryRelation.some = {};
                    }
                    if(!countRelation.some){
                        countRelation.some = {}
                    }

                    const querySome = queryRelation.some as Record<string, unknown>;
                    const countSome = countRelation.some as Record<string, unknown>;

                    if(!querySome[nestedRelation]){
                        querySome[nestedRelation] = {}
                    }

                    if(!countSome[nestedRelation]){
                        countSome[nestedRelation] = {}
                    }

                    const queryNestedRelation = querySome[nestedRelation] as Record<string, unknown>;
                    const countNestedRelation = countSome[nestedRelation] as Record<string, unknown>;

                    queryNestedRelation[nestedField] = this.parseFilterValue(value);
                    countNestedRelation[nestedField] = this.parseFilterValue(value)
                }
            }
        })
    }
}