import {getMyCharactersMyCharactersGet, type MyCharactersListSchema} from "@generated/artifactsmmo";

export class MyCharacters {

    async getList(): Promise<MyCharactersListSchema> {

       const {data, error} = await getMyCharactersMyCharactersGet();

       if(!data) {
           return null;
       }

       return data;
        

    }



}
