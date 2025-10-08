import express from "express";
import Plant from "../models/Plant.js";

const router=express.Router();

// to create a new plant data and add it to the database
router.post("/plants",async (req,res)=>{
    try{
        const plantData = new Plant(req.body); //creating new plant data
        await plantData.save();
        res.status(200).json({message: "Successfully created", plant: plantData});
    }

    catch(err){
        res.status(400).json({error:err.message});
    }
});


//to get all the plants from the database

router.get("/plants",async(req,res)=>{
    try{
        const plantData=await Plant.find();
        res.json(plantData);
    }

    catch(err){
        res.status(400).json({error:err.message});
    }
});

//to get specific plant from the database

router.get("/plants/:id",async(req,res)=>{
    try{
        const plantData = await Plant.findById(req.params.id);
        if(!plantData){
            return res.status(400).json({message:"No plant is found"});
        }

        else{
            res.status(200).json({message:"plant is found"});
            return res.json(plantData);
        }
    }

    catch(err){
        res.status(400).json({error:err.message});
    }
});


// to update the exsisting plant details

router.put("/plants/:id",async (req,res)=>{
    try{
        const updatedPlant=await Plant.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true});
            if(!updatedPlant){
                return res.status(400).json({message:"The plant is not updated or not found"});
        
            }
            else{
                res.status(200).json({message:"Updated Successfully"});
                return res.json(updatedPlant);
            }

    }

    catch(err){
        return res.status(400).json({error:err.message});
    }
   

});


//To Deletethe plant from the database

router.delete("/plants/:id",async (req,res)=>{
    try{
        const deletedPlant = await Plant.findByIdAndDelete(req.params.id);
        if(!deletedPlant){
            return res.status(404).json({message:"Plant not found"});
        }
        res.status(200).json({message:"Plant deleted Successfully"});
    }
    catch(err){
        return res.status(404).json({error:err.message});
    }
});


export default router;