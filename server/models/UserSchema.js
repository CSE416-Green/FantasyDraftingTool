const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        maxlength: [100, 'first name cannot exceed 100 characters.']
    },
    lastName:{
        type: String,
        required: false,
        maxlength: [100, 'last name cannot exceed 100 characters.']
    },
    username:{
        type:String,
        required: true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required: true,
    }
},{timestamps:true});

module.exports=mongoose.model("User", userSchema);