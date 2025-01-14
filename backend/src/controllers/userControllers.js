import bcrypt,{hash} from "bcrypt";
import { User } from "../models/userModels.js";
import httpStatus from "http-status";
import crypto from "crypto";


const login = async(req,res)=>{
    const {userName,password} = req.body;
    
   

    if(!userName || !password){
        return res.status(400).json({message: "please provide"});
    }
    try{
        const user = await User.findOne({userName});
      
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message: "User not found"});
        }
        const password = await bcrypt.compare(userName,user.password);
        console.log(password)
        if(password){
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({token: token})
        }else{
            return res.status(httpStatus.OK).json({message: "Invalid username or password"});
        }
    }catch(err){
        return res.status(500).json({message: `something went worng${err}`});

  
}
}


const register = async(req,res)=>{
    const {name,userName,password} = req.body;
    
    try{
        const existingUser = await User.findOne({userName})
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message: "user already exists"});
        }
        const hashPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            name: name,
            userName: userName,
            password: hashPassword,
        })
        console.log(newUser);
        
        await newUser.save()

        res.status(httpStatus.CREATED).json({message: "user registered successfully"});
    }catch(e){

        res.json({message: `something went wrong ${e}`});
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

export {login,register,getUserHistory,addToHistory}