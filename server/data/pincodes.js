// Offline snapshot of India Post records, captured from
// https://api.postalpincode.in/pincode/{PIN} (the JSON API behind postalpincode.in).
//
// This is ONLY a fallback for when the server has no outbound internet access —
// the live API is always tried first, and the browser can also query it directly.
// Each entry holds every post office / locality that shares the PIN, which is what
// powers the "City / Locality" picker.

const po = (name, branchType, delivery, district, state, division = '', block = '', circle = '') => ({
  name,
  branchType,
  delivery,
  district,
  state,
  division,
  block,
  circle,
});

export const PINCODES = {
  '533101': [
    po('Rajahmundry', 'Head Post Office', 'Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry', 'Andhra Pradesh'),
    po('Alcot Gardens', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry (Urban)', 'Andhra Pradesh'),
    po('Fort Gate', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry (Urban)', 'Andhra Pradesh'),
    po('Ramakrishna Nagar', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry Rural', 'Andhra Pradesh'),
    po('Syamalamba Temple', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry (Urban)', 'Andhra Pradesh'),
    po('Vullithota', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry (Urban)', 'Andhra Pradesh'),
  ],
  '533103': [
    po('Danavaipeta', 'Sub Post Office', 'Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry (Urban)', 'Andhra Pradesh'),
    po('Rtc Bus Complex Centre', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry (Urban)', 'Andhra Pradesh'),
    po('Syamalanagar', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Rajahmundry', 'Rajahmundry (Urban)', 'Andhra Pradesh'),
  ],
  '533001': [
    po('Kakinada', 'Head Post Office', 'Delivery', 'East Godavari', 'Andhra Pradesh', 'Kakinada', 'Kakinada', 'Andhra Pradesh'),
    po('Govt.Gen Hospital', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Kakinada', 'Kakinada (Urban)', 'Andhra Pradesh'),
    po('Kakinada Bazar', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Kakinada', 'Kakinada (Urban)', 'Andhra Pradesh'),
    po('KD-collectorate', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Kakinada', 'Kakinada (Urban)', 'Andhra Pradesh'),
    po('Suryaraopeta', 'Sub Post Office', 'Non-Delivery', 'East Godavari', 'Andhra Pradesh', 'Kakinada', 'Kakinada (Urban)', 'Andhra Pradesh'),
  ],
  '530001': [
    po('Visakhapatnam', 'Head Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam (Urban)', 'Andhra Pradesh'),
    po('Fortward', 'Sub Post Office', 'Non-Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Kurupam Market', 'Sub Post Office', 'Non-Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
  ],
  '531173': [
    po('Pendurthy', 'Sub Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Chinamushidiwada', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Chintalapalem', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Gandigundam', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Gidijala', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Gorapalle', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Gudilova', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Gurrampalem', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Pedagadi', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Rampuram', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Saripalli', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('Sontyam', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
    po('V. Juttada', 'Branch Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
  ],
  '530016': [
    po('Akkayyapalem', 'Sub Post Office', 'Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam (Urban)', 'Andhra Pradesh'),
    po('Dwarakanagar', 'Sub Post Office', 'Non-Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam (Urban)', 'Andhra Pradesh'),
    po('New Colony', 'Sub Post Office', 'Non-Delivery', 'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
  ],
  '520010': [
    po('Venkateswarapuram', 'Sub Post Office', 'Delivery', 'Krishna', 'Andhra Pradesh', 'Vijayawada', 'Vijayawada (Urban)', 'Andhra Pradesh'),
    po('Chandramoulipuram', 'Sub Post Office', 'Non-Delivery', 'Krishna', 'Andhra Pradesh', 'Vijayawada', 'Vijayawada (Urban)', 'Andhra Pradesh'),
    po('Moghalrajpuram', 'Sub Post Office', 'Non-Delivery', 'Krishna', 'Andhra Pradesh', 'Vijayawada', 'Vijayawada (Urban)', 'Andhra Pradesh'),
    po('Patamata', 'Sub Post Office', 'Non-Delivery', 'Krishna', 'Andhra Pradesh', 'Vijayawada', 'Vijayawada (Urban)', 'Andhra Pradesh'),
    po('Punnamathota', 'Sub Post Office', 'Non-Delivery', 'Krishna', 'Andhra Pradesh', 'Vijayawada', 'Vijayawada (Urban)', 'Andhra Pradesh'),
  ],
  '500081': [
    po('Cyberabad', 'Sub Post Office', 'Delivery', 'Hyderabad', 'Telangana', 'Hyderabad City', 'Shaikpet', 'Andhra Pradesh'),
    po('Madhapur', 'Branch Post Office', 'Non-Delivery', 'Hyderabad', 'Telangana', 'Hyderabad City', 'Shaikpet', 'Andhra Pradesh'),
  ],
  '500032': [
    po('Manuu', 'Sub Post Office', 'Delivery', 'Hyderabad', 'Telangana', 'Hyderabad City', 'Seri Lingampally', 'Andhra Pradesh'),
    po('Gachibowli', 'Sub Post Office', 'Non-Delivery', 'K.V.Rangareddy', 'Telangana', 'Hyderabad City', 'Seri Lingampally', 'Andhra Pradesh'),
  ],
  '560001': [
    po('Bangalore', 'Head Post Office', 'Delivery', 'Bangalore', 'Karnataka', 'Bangalore GPO', 'Bangalore North', 'Karnataka'),
    po('Bangalore Bazaar', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', 'Bangalore North', 'Karnataka'),
    po('CMM Court Complex', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', 'Bangalore', 'Karnataka'),
    po('Dr. Ambedkar Veedhi', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', 'Bangalore North', 'Karnataka'),
    po('HighCourt', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', 'Bangalore North', 'Karnataka'),
    po('Legislators Home', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', 'Bangalore North', 'Karnataka'),
    po('Mahatma Gandhi Road', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', 'Bangalore North', 'Karnataka'),
    po('Rajbhavan (Bangalore)', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', 'Bangalore North', 'Karnataka'),
    po('Vasanthanagar', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', '', 'Karnataka'),
    po('Vidhana Soudha', 'Sub Post Office', 'Non-Delivery', 'Bangalore', 'Karnataka', 'Bangalore East', 'Bangalore North', 'Karnataka'),
  ],
  '600001': [
    po('Chennai', 'Head Post Office', 'Delivery', 'Chennai', 'Tamil Nadu', 'Chennai GPO', 'Chennai', 'Tamilnadu'),
    po('Flower Bazaar', 'Sub Post Office', 'Non-Delivery', 'Chennai', 'Tamil Nadu', 'Chennai City North', '', 'Tamilnadu'),
    po('Govt Stanley Hospital', 'Sub Post Office', 'Non-Delivery', 'Chennai', 'Tamil Nadu', 'Chennai City North', 'Tondiarpet Fort St George', 'Tamilnadu'),
    po('Mannady (Chennai)', 'Sub Post Office', 'Non-Delivery', 'Chennai', 'Tamil Nadu', 'Chennai City North', 'Tondiarpet Fort St George', 'Tamilnadu'),
    po('Mint Building', 'Sub Post Office', 'Non-Delivery', 'Chennai', 'Tamil Nadu', 'Chennai City North', 'Tondiarpet Fort St George', 'Tamilnadu'),
    po('MPT AO', 'Sub Post Office', 'Non-Delivery', 'Chennai', 'Tamil Nadu', 'Chennai City North', 'Tondiarpet Fort St Goerge', 'Tamilnadu'),
    po('Sowcarpet', 'Sub Post Office', 'Non-Delivery', 'Chennai', 'Tamil Nadu', 'Chennai City North', 'Tondiarpet Fort St George', 'Tamilnadu'),
  ],
  '400001': [
    po('Mumbai', 'Head Post Office', 'Delivery', 'Mumbai', 'Maharashtra', 'Mumbai G.P.O.', 'Mumbai', 'Maharashtra'),
    po('Elephanta Caves Po', 'Branch Office directly a/w Head Office', 'Delivery', 'Raigarh(MH)', 'Maharashtra', 'Mumbai South', 'Uran', 'Maharashtra'),
    po('Bazargate', 'Sub Post Office', 'Non-Delivery', 'Mumbai', 'Maharashtra', 'Mumbai South', 'Mumbai', 'Maharashtra'),
    po('M.P.T.', 'Sub Post Office', 'Non-Delivery', 'Mumbai', 'Maharashtra', 'Mumbai South', 'Mumbai', 'Maharashtra'),
    po('Stock Exchange', 'Sub Post Office', 'Non-Delivery', 'Mumbai', 'Maharashtra', 'Mumbai South', 'Mumbai', 'Maharashtra'),
    po('Tajmahal', 'Sub Post Office', 'Non-Delivery', 'Mumbai', 'Maharashtra', 'Mumbai South', 'Mumbai', 'Maharashtra'),
    po('Town Hall (Mumbai)', 'Sub Post Office', 'Non-Delivery', 'Mumbai', 'Maharashtra', 'Mumbai South', 'Mumbai', 'Maharashtra'),
  ],
  '110001': [
    po('New Delhi', 'Head Post Office', 'Delivery', 'New Delhi', 'Delhi', 'New Delhi GPO', 'New Delhi', 'Delhi'),
    po('Connaught Place', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Baroda House', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Bengali Market', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Bhagat Singh Market', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Janpath', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Krishi Bhawan', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Parliament House', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Pragati Maidan', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Rail Bhawan', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Sansad Marg', 'Head Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Shastri Bhawan', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
    po('Supreme Court', 'Sub Post Office', 'Non-Delivery', 'Central Delhi', 'Delhi', 'New Delhi Central', 'New Delhi', 'Delhi'),
  ],
  '700001': [
    po('Kolkatta', 'Head Post Office', 'Delivery', 'Kolkata', 'West Bengal', 'Kolkata GPO', 'Kolkata', 'West Bengal'),
    po('Council House Street', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('Customs House', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('Khengrapatti', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('Lalbazar (Kolkata)', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('New Secretariat Bldg.', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('Pollock Street', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', '', 'West Bengal'),
    po('R.N. Mukherjee Road', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('Radha Bazar', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('Reserve Bank Building', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('Telephone Bhawan', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('Treasury Building', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po('W.B.Assembly House', 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
    po("Writer's Building", 'Sub Post Office', 'Non-Delivery', 'Kolkata', 'West Bengal', 'Kolkata Central', 'Kolkata', 'West Bengal'),
  ],
  '411001': [
    po('Pune', 'Head Post Office', 'Delivery', 'Pune', 'Maharashtra', 'Pune City East', 'Pune City', 'Maharashtra'),
    po('C D A (O)', 'Sub Post Office', 'Non-Delivery', 'Pune', 'Maharashtra', 'Pune City East', 'Pune City', 'Maharashtra'),
    po('Dr.B.A. Chowk', 'Sub Post Office', 'Non-Delivery', 'Pune', 'Maharashtra', 'Pune City East', 'Pune City', 'Maharashtra'),
    po('Ghorpuri Bazar', 'Sub Post Office', 'Non-Delivery', 'Pune', 'Maharashtra', 'Pune City East', 'Pune City', 'Maharashtra'),
    po('N.W. College', 'Sub Post Office', 'Non-Delivery', 'Pune', 'Maharashtra', 'Pune City East', 'Pune City', 'Maharashtra'),
    po('Pune Cantt East', 'Sub Post Office', 'Non-Delivery', 'Pune', 'Maharashtra', 'Pune City East', 'Pune City', 'Maharashtra'),
    po('Pune New Bazar', 'Sub Post Office', 'Non-Delivery', 'Pune', 'Maharashtra', 'Pune City East', 'Pune City', 'Maharashtra'),
    po('Sachapir Street', 'Sub Post Office', 'Non-Delivery', 'Pune', 'Maharashtra', 'Pune City East', 'Pune City', 'Maharashtra'),
  ],
  '682001': [
    po('Ernakulam', 'Head Post Office', 'Delivery', 'Ernakulam', 'Kerala', 'Ernakulam', 'Kochi', 'Kerala'),
    po('Broadway (Ernakulam)', 'Sub Post Office', 'Non-Delivery', 'Ernakulam', 'Kerala', 'Ernakulam', 'Kochi', 'Kerala'),
  ],
  '380001': [
    po('Ahmedabad G.P.O.', 'Head Post Office', 'Delivery', 'Ahmedabad', 'Gujarat', 'Ahmedabad City', 'Ahmedabad', 'Gujarat'),
    po('Gandhi Road (Ahmedabad)', 'Sub Post Office', 'Non-Delivery', 'Ahmedabad', 'Gujarat', 'Ahmedabad City', 'Ahmedabad', 'Gujarat'),
  ],
  '500001': [
    po('Hyderabad G.P.O.', 'Head Post Office', 'Delivery', 'Hyderabad', 'Telangana', 'Hyderabad City', 'Hyderabad', 'Andhra Pradesh'),
    po('Secunderabad', 'Sub Post Office', 'Non-Delivery', 'Hyderabad', 'Telangana', 'Hyderabad City', 'Hyderabad', 'Andhra Pradesh'),
  ],
  '520001': [
    po('Vijayawada', 'Head Post Office', 'Delivery', 'Krishna', 'Andhra Pradesh', 'Vijayawada', 'Vijayawada (Urban)', 'Andhra Pradesh'),
    po('Governorpet', 'Sub Post Office', 'Non-Delivery', 'Krishna', 'Andhra Pradesh', 'Vijayawada', 'Vijayawada (Urban)', 'Andhra Pradesh'),
  ],
};

// Flattened index so we can also search by locality / post office name.
export const OFFICE_INDEX = Object.entries(PINCODES).flatMap(([pincode, offices]) =>
  offices.map((o) => ({ ...o, pincode }))
);
