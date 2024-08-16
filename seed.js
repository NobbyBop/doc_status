import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import { createEvent, getEvents } from "./data/events.js";

let connect = await dbConnection();
await connect.dropDatabase();

function generateEvent(id, timestamp, actor, action, targetPath, isFolder) {
    return {
        id: id,
        timestamp: timestamp,
        actor: actor,
        type: "file_system",
        action: action,
        data: {
            target_path: targetPath,
            is_folder: isFolder
        },
        action_source: "PublicAPI"
    };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pad(number) {
    return number < 10 ? '0' + number : number;
}

function formatDate(date) {
    return date.getUTCFullYear() +
        '-' + pad(date.getUTCMonth() + 1) +
        '-' + pad(date.getUTCDate()) +
        'T' + pad(date.getUTCHours()) +
        ':' + pad(date.getUTCMinutes()) +
        ':' + pad(date.getUTCSeconds()) +
        '.000Z';
}

const actions = ["create", "delete", "update", "move"];
const paths = [
    "/Projects/ProjectA/",
    "/Projects/ProjectB/",
    "/Projects/ProjectC/",
    "/Projects/ProjectD/",
    "/Projects/ProjectE/"
];
const disciplines = ["Subfolder1", "Subfolder2", "Subfolder3", "Subfolder4"]

function getRandomPath(paths, disciplines) {
    // Generate a random index for paths and disciplines
    const randomPathIndex = Math.floor(Math.random() * paths.length);
    const randomDisciplineIndex = Math.floor(Math.random() * disciplines.length);

    // Generate a random number for the document
    const randomDocumentNumber = Math.floor(Math.random() * 10) + 1; // Assuming document numbers range from 1 to 10

    // Construct the random path
    const randomPath = `${paths[randomPathIndex]}${disciplines[randomDisciplineIndex]}/document${randomDocumentNumber}`;

    return randomPath;
}

export function generateEvents(){
    let events = []
    for (let i = 0; i < 20; i++) {
        const id = randomInt(1000, 9999);
        const timestamp = formatDate(randomDate(new Date(2024, 0, 1), new Date(2024, 5, 31)));
        const actor = randomInt(1000000000, 9999999999);
        const action = actions[randomInt(0, actions.length - 1)];
        const targetPath = getRandomPath(paths, disciplines);
        const isFolder = targetPath.endsWith("/");

        events.push(generateEvent(id, timestamp, actor, action, targetPath, isFolder))
        
        // ev = await createEvent(generateEvent(id, timestamp, actor, action, targetPath, isFolder));
    }
    events.sort((a, b) =>{
        let dateA = new Date(a.timestamp)
        let dateB = new Date(b.timestamp)
        if(dateA < dateB) return -1
        else return 1
    })
    return events
}

let events = generateEvents()
for (let e of events){
    await createEvent(e)
}

// let all = await getEvents()
// console.log(all.length)

closeConnection();
