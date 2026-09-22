import {getMyCharactersMyCharactersGet} from "@generated/artifactsmmo";
import {Character} from "@/model/character.class";

export class MyCharacters {

    static async getCharacters(): Promise<Character[]> {

        const {data} = await getMyCharactersMyCharactersGet();

        return data.data.map(characterSchema => new Character(characterSchema));

    }


}
