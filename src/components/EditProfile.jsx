import { useState, useEffect, useRef } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import {generateAboutMe} from "../utils/generateAbout";

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();
  const dropdownRef = useRef(null); 

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age || '');
  const [gender, setGender] = useState(user.gender);
  const [about, setAbout] = useState(user.about || '');
  const [skills, setSkills] = useState(user.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSelectGender = (selectedGender) => {
    setGender(selectedGender);
    setDropdownOpen(false);
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const saveProfile = async () => {
    setError("");
    try {
      const res = await axios.patch( BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
          skills
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 1000);
    } catch (err) {
      setError(err.response.data);
    }
  };

  const handleGenerateAboutMe = async () => {
    const userDetails = {
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age || '',
      gender: user.gender,
      skills: user.skills || []
    };
    const aiGeneratedText = await generateAboutMe(userDetails, about);
    setAbout(aiGeneratedText);
  };

  return (
    <>
      <div className="flex justify-center my-10">
        <div className="flex justify-center mx-10">
          <div className="card bg-base-300 w-96 shadow-xl">
            <div className="card-body">
              <h2 className="card-title justify-center">Edit Profile</h2>
              <div>
                <label className="form-control w-full max-w-xs my-2">
                  <div className="label">
                    <span className="label-text">First Name:</span>
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </label>
                <label className="form-control w-full max-w-xs my-2">
                  <label className="form-control w-full max-w-xs my-2">
                    <div className="label">
                      <span className="label-text">Last Name:</span>
                    </div>
                    <input
                      type="text"
                      value={lastName}
                      className="input input-bordered w-full max-w-xs"
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </label>
                  <div className="label">
                    <span className="label-text">Photo URL :</span>
                  </div>
                  <input
                    type="text"
                    value={photoUrl}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                </label>
                <label className="form-control w-full max-w-xs my-2">
                  <div className="label">
                    <span className="label-text">Age:</span>
                  </div>
                  <input
                    type="text"
                    value={age}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setAge(e.target.value)}
                  />
                </label>
                <label className="form-control w-full max-w-xs my-2">
                <div className="label">
                  <span className="label-text">Gender:</span>
                </div>
                <div className="relative" ref={dropdownRef}>  
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="input input-bordered w-full max-w-xs text-left"
                  >
                    {gender || "Select Gender"}
                  </button>
                  {dropdownOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-base-100 rounded-box shadow-lg">
                      {["Male", "Female", "Other"].map((option) => (
                        <li key={option}>
                          <button
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-base-200"
                            onClick={() => handleSelectGender(option)}
                          >
                            {option}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
               </label>
                <label className="form-control w-full max-w-xs my-2">
                  <div className="label flex items-center justify-between">
                    <span className="label-text">About:</span>
                    <button className="btn btn-secondary btn-xs" onClick={handleGenerateAboutMe}>AI </button>
                  </div>
                  <textarea 
                    className="textarea textarea-bordered" 
                    onChange={(e) => setAbout(e.target.value)}
                    value={about}
                  >
                  </textarea>
                </label>
                <label className="form-control w-full max-w-xs my-2">
                  <div className="label">
                    <span className="label-text">Skills:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div key={index} className="badge badge-primary flex items-center gap-1">
                        {skill}
                        <button className="ml-1 text-white" onClick={() => removeSkill(skill)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newSkill}
                    className="input input-bordered w-full max-w-xs mt-2"
                    placeholder="Type new skill and press Enter to add"
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill(e)}
                  />
                </label>
              </div>
              <p className="text-red-500">{error}</p>
              <div className="card-actions justify-center m-2">
                <button className="btn btn-primary" onClick={saveProfile}>
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        <UserCard
          user={{ firstName, lastName, photoUrl, age, gender, about, skills }}
        />
      </div>
      {showToast && (
        <div className="toast toast-top toast-center">
          <div className="alert alert-success">
            <span>Profile saved successfully.</span>
          </div>
        </div>
      )}
    </>
  );
};
export default EditProfile;