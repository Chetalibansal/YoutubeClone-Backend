import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url service will be used to store the video
            required: true
        },
        thumbnail: {
            type: String, //cloudinary url service will be used to store the thumbnail
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref : "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration:{
            type: Number, //we will get this from the video file stored in cloudinary
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    }, {timeStamps: true})

videoSchema.plugin(mongooseAggregatePaginate)  // To enable pagination on aggregate queries    

export const Video = mongoose.model("Video", videoSchema);

