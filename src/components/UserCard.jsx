import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
    const { _id, firstName, lastName, photoUrl, age, gender, about, skills } = user;
    const dispatch = useDispatch();
    const handleSendRequest = async (status, userId) => {
      try {
        await axios.post(
          BASE_URL + "/request/send/" + status + "/" + userId,
          {},
          { withCredentials: true }
        );
        dispatch(removeUserFromFeed(userId));
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div className="card bg-base-300 w-96 shadow-xl">
        <figure>
          <img src={user.photoUrl} alt="photo" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{firstName + " " + lastName}</h2>
          {(age || gender) && (
                    <p className="text-sm text-gray-600">{age && gender ? `${age}, ${gender}` : age || gender}</p>
          )}
          {about && <p className="mt-2 text-gray-700">{about}</p>}
          {skills && skills.length > 0 && (
                    <div className="my-2">
                        <h3 className="font-semibold">Skills:</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {skills.map((skill, index) => (
                                <span key={index} className="badge badge-primary">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                
          <div className="card-actions justify-center my-4">
            <button
                className="btn btn-primary"
                onClick={() => handleSendRequest("ignored", _id)}
            >
                Ignore
            </button>
            <button
                className="btn btn-secondary"
                onClick={() => handleSendRequest("interested", _id)}
            >
                Interested
            </button>
          </div>
        </div>
      </div>
    );
  };
  export default UserCard;