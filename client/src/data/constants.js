export const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

export const BLOOD_GROUP_COLORS = {
  "A+": { bg: "#FDF2F8", text: "#DB2777", darkBg: "rgba(236,72,153,0.15)", darkText: "#F472B6" },
  "A-": { bg: "#FCE7F3", text: "#BE185D", darkBg: "rgba(236,72,153,0.12)", darkText: "#EC4899" },
  "B+": { bg: "#EFF6FF", text: "#2563EB", darkBg: "rgba(59,130,246,0.15)", darkText: "#60A5FA" },
  "B-": { bg: "#DBEAFE", text: "#1D4ED8", darkBg: "rgba(59,130,246,0.12)", darkText: "#93C5FD" },
  "AB+": { bg: "#F5F3FF", text: "#7C3AED", darkBg: "rgba(139,92,246,0.15)", darkText: "#A78BFA" },
  "AB-": { bg: "#EDE9FE", text: "#6D28D9", darkBg: "rgba(139,92,246,0.12)", darkText: "#C4B5FD" },
  "O+": { bg: "#ECFDF5", text: "#059669", darkBg: "rgba(5,150,105,0.15)", darkText: "#34D399" },
  "O-": { bg: "#D1FAE5", text: "#047857", darkBg: "rgba(5,150,105,0.12)", darkText: "#6EE7B7" },
};

export const DISTRICTS = [
  "Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barishal","Rangpur",
  "Mymensingh","Comilla","Gazipur","Narayanganj","Bogra","Cox's Bazar","Tangail","Dinajpur",
];

export const AREAS = {
  Dhaka: ["Gulshan","Banani","Dhanmondi","Mirpur","Uttara","Mohammadpur","Tejgaon","Motijheel","Old Dhaka","Bashundhara","Baridhara","Farmgate","Shahbag","Ramna","Paltan","Khilgaon","Badda","Rampura"],
  Chittagong: ["Agrabad","Nasirabad","GEC Circle","Chawk Bazar","Kotwali","Hathazari"],
  Sylhet: ["Zindabazar","Ambarkhana","Sylhet Sadar","Beanibazar","Moulvibazar"],
  Rajshahi: ["Rajshahi Sadar","Boalia","Motihar","Shah Makhdum","Paba"],
  Khulna: ["Khulna Sadar","Sonadanga","Khalishpur","Daulatpur","Rupsha"],
  Barishal: ["Barishal Sadar","Bakerganj","Babuganj","Banaripara"],
  Rangpur: ["Rangpur Sadar","Gangachara","Taraganj","Badarganj"],
  Mymensingh: ["Mymensingh Sadar","Muktagachha","Phulbari","Gouripur"],
  Comilla: ["Comilla Sadar","Debidwar"],
  Gazipur: ["Gazipur Sadar","Tongi","Konabari","Kaliakair"],
  Narayanganj: ["Narayanganj Sadar","Fatulla","Sonargaon"],
  Bogra: ["Bogra Sadar","Sherpur","Shajahanpur"],
  "Cox's Bazar": ["Cox's Bazar Sadar","Chakaria","Teknaf","Ukhia"],
  Tangail: ["Tangail Sadar","Mirzapur","Gopalpur"],
  Dinajpur: ["Dinajpur Sadar","Parbatipur","Birganj"],
};

export const URGENCY = [
  { value: "critical", label: "Critical", color: "badge-red" },
  { value: "urgent", label: "Urgent", color: "badge-yellow" },
  { value: "normal", label: "Normal", color: "badge-green" },
];

export const STATUS = [
  { value: "open", label: "Open", color: "badge-green" },
  { value: "accepted", label: "Accepted", color: "badge-blue" },
  { value: "completed", label: "Completed", color: "badge-gray" },
  { value: "cancelled", label: "Cancelled", color: "badge-red" },
];

export const STATS = [
  { value: "10,000+", label: "Registered Donors" },
  { value: "5,000+", label: "Lives Saved" },
  { value: "64", label: "Districts Covered" },
  { value: "24/7", label: "Emergency Support" },
];

export const TESTIMONIALS = [
  { name: "Dr. Ahmed Hassan", role: "Senior Consultant", content: "LifeDrop has revolutionized how we find blood donors. The platform has helped save countless lives in emergency situations." },
  { name: "Fatima Rahman", role: "Regular Donor", content: "I've been using LifeDrop for over a year. It's so easy to find nearby blood requests and help those in need." },
  { name: "Kamal Hossain", role: "Blood Seeker", content: "When my father needed emergency surgery, LifeDrop helped us find the right donor within minutes. Truly a lifesaver!" },
];

export const FAQS = [
  { question: "How do I register as a donor?", answer: "Click on 'Become a Donor' and fill out the registration form. After verification, your profile will be visible to those in need." },
  { question: "Is there any cost to use LifeDrop?", answer: "No, LifeDrop is completely free for both donors and seekers. Our mission is to save lives." },
  { question: "How are donors verified?", answer: "Our team manually verifies each donor's information including their blood group and medical history." },
  { question: "How often can I donate blood?", answer: "You can donate blood every 56 days (8 weeks). LifeDrop will remind you when you're eligible again." },
];
