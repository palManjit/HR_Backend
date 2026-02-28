import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      validate: {
        validator: function (v) {
          return /^\+?[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    aadhar: {
      type: String,
      unique: true,
      sparse: true,
    },

    pan: {
      type: String,
      unique: true,
      sparse: true,
    },

    aadharImg: {
      type: String,
    },

    panImg: {
      type: String,
    },

    pvc: {
      type: String,
    },

    certificate: [
      {
        type: String,
      },
    ],

    photo: {
      type: String,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    role: {
      type: String,
      enum: [
        "admin",
        "employee",
        "manager",
        "hr",
        "it",
        "candidate",
        "accountant",
      ],
      default: "candidate",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    employeeID: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    leaveBalance: {
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
      casual: {
        type: Number,
        default: 0,
        min: 0,
      },
      medical: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  this.leaveBalance.total =
    this.leaveBalance.casual + this.leaveBalance.medical;
  next();
});

userSchema.plugin(mongoosePaginate);

export const User = mongoose.model("User", userSchema);