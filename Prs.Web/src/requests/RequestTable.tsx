import { useState, useEffect, SyntheticEvent } from "react";
import { IRequest } from "./IRequest";
import { requestAPI } from "./RequestAPI";
import { userAPI } from "../users/UserAPI";
import { IUser } from "../users/IUser";
import RequestRow from "./RequestRow";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useUserContext } from "../App";

function RequestTable() {
  const { user } = useUserContext();
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await userAPI.list();
        setAllUsers(data);
      } catch (error: any) {
        toast.error("Could not load users for the dropdown.", { duration: 6000 });
      }
    }
    loadUsers();
  }, []);

  async function loadRequests() {
    try {
      const data = await requestAPI.list(searchParams.get("status") ?? undefined, searchParams.get("userId") ?? undefined);
      setRequests(data);
    } catch (error: any) {
      toast.error(error.message, { duration: 6000 });
    }
  }

  useEffect(() => {
    loadRequests();
  }, [searchParams.get("status"), searchParams.get("userId")]);

  function removeRequest(request: IRequest) {
    setRequests(requests.filter((r) => r.id !== request.id));
  }

  function handleStatusChange(event: SyntheticEvent) {
    const newStatus = (event.target as HTMLSelectElement).value;

    setSearchParams((prevParams) => {
      if (newStatus) {
        prevParams.set("status", newStatus);
      } else {
        prevParams.delete("status");
      }
      return prevParams;
    });
  }

  function handleRequesterChange(event: SyntheticEvent) {
    const newUserId = (event.target as HTMLSelectElement).value;

    setSearchParams((prevParams) => {
      if (newUserId) {
        prevParams.set("userId", newUserId);
      } else {
        prevParams.delete("userId");
      }
      return prevParams;
    });
  }

  return (
    <>
      <div className="d-flex flex-row gap-4 mb-4 w-50">
        <div className="d-flex flex-column w-50">
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select id="status" className="form-select" value={searchParams.get("status") ?? ""} onChange={handleStatusChange}>
            <option value="">All</option>
            <option value="NEW">New</option>
            <option value="REVIEW">Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="d-flex flex-column w-50">
          <label htmlFor="userId" className="form-label">
            Requested By
          </label>
          <select id="userId" className="form-select" value={searchParams.get("userId") ?? ""} onChange={handleRequesterChange}>
            <option value="">Anyone</option>
            {user && (
              <option value={user.id}>
                {user.firstName} {user.lastName} (you)
              </option>
            )}
            {allUsers
              .filter((u) => u.id !== user?.id)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
          </select>
        </div>
      </div>

      <section className="list d-flex flex-row flex-wrap bg-body-tertiary gap-5 p-4 rounded-4">
        <table className="table table-hover w-75 table rounded-4">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Description</th>
              <th scope="col">Status</th>
              <th scope="col">Total</th>
              <th scope="col">Requested By</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <RequestRow key={request.id} request={request} onRemove={removeRequest} />
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default RequestTable;
