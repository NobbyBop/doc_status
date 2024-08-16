import { generateTree, getEvents, getEventsFiltered } from "./data/events.js";
import express from "express"
import { Router } from "express";
import exphbs from "express-handlebars";
import { getPullTimestamp, updatePullTimestamp } from "./data/metadata.js";
import { validateEvent, validateFolders, validateDates } from "./validation.js";

const app = express()

app.use(express.json());
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: true }));

const router = Router()

router.route("/").get(async (req, res) =>{
    // On initially loading the page, the events are pulled from the database 
    // and then they are used to generate the Project and Subfolder options.
    let events = []
    try{
        events = await getEvents()
    } catch(e){
        return res.status(500).json({error:"Internal Server Error"})
    }
    let tree = generateTree(events)
    let timestamp = await getPullTimestamp()
    return res.render("home", {mute:true, events, projects:tree.projects, subfolders:tree.subfolders, timestamp})
})
.post(async (req, res)=>{
    let events = []
    try{
        validateFolders(req.body.locations) 
        validateFolders(req.body.subfolders)
        validateDates(req.body.startDate, req.body.endDate)
    } catch(e){
        return res.status(400).json({error:e.message})
    }
    try{
        events = await getEventsFiltered(req.body.locations, 
            req.body.subfolders,
            req.body.startDate,
            req.body.endDate)
    } catch(e){
        return res.status(500).json({error:"Internal Server Error"})
    }
    let allEvents = await getEvents()
    let tree = generateTree(allEvents)

    if(req.body.pullAPI){
        // This is where the the code to pull from the API into the database would occur.
        await updatePullTimestamp()
    }

    let timestamp = await getPullTimestamp()
    return res.render("home", {events, projects:tree.projects, subfolders:tree.subfolders, timestamp})
})

app.use("/", router)
app.use("*", (req, res) => {
    return res.status(404).send("not found");
});

app.listen(3000, () => {
	console.log("server running on http://localhost:3000");
});