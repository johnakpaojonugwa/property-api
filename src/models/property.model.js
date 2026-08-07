import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      minlength: [2, 'name must be at least 2 characters'],
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [1000, 'price must be at least 1000'],
    },
    country: {
      type: String,
      required: [true, 'country is required'],
      trim: true,
      minlength: [2, 'country must be at least 2 characters'],
    },
    state: {
      type: String,
      required: [true, 'state is required'],
      trim: true,
      minlength: [2, 'state must be at least 2 characters'],
    },
    city: {
      type: String,
      required: [true, 'city is required'],
      trim: true,
      minlength: [2, 'city must be at least 2 characters'],
    },
    lat: Number,
    lng: Number,
    address: String,
    description: String,
    category: { type: String, enum: ['FLAT', 'APARTMENT', 'LAND', 'DUPLEX', 'WAREHOUSE', 'SHOP'], required: true },
    total_area: String,
    property_use: { type: String, enum: ['RESIDENTIAL', 'COMMERCIAL'], required: true },
    payment_plan: { type: String, enum: ['PER_ANNUM', 'MONTHLY', 'PER_PLOT', 'PER_DAY'], required: true },
    type: { type: String, enum: ['RENT', 'LEASE', 'SALES'], required: true },
    bedroom: Number,
    bathroom: Number,
    toilet: Number,
    parking_space: Number,
    furnishing: { type: String, enum: ['FURNISHED', 'UNFURNISHED'] },
    disclaimer: String,
    amenities: [String],
    images: [String],
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
    is_verified: { type: Boolean, default: false },
    is_sold: { type: Boolean, default: false },
  },
  { timestamps: true },
);

propertySchema.index({ city: 1, is_verified: 1, createdAt: -1 });
propertySchema.index({ agent: 1 });
propertySchema.index({ lat: 1, lng: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
