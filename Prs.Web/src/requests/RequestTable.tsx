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
      const data = await requestAPI.list(
        searchParams.get("status") ?? undefined,
        searchParams.get("userId") ?? undefined,
        searchParams.get("search") ?? undefined,
        searchParams.get("sort") ?? undefined,
      );
      setRequests(data);
    } catch (error: any) {
      toast.error(error.message, { duration: 6000 });
    }
  }

  useEffect(() => {
    loadRequests();
  }, [searchParams.get("status"), searchParams.get("userId"), searchParams.get("search"), searchParams.get("sort")]);

  function removeRequest(request: IRequest) {
    setRequests(requests.filter((r) => r.id !== request.id));
  }

  function handleStatusChange(event: SyntheticEvent) {
    const newStatus = (event.target as HTMLSelectElement).value;
    setSearchParams((prevParams) => {
      if (newStatus) prevParams.set("status", newStatus);
      else prevParams.delete("status");
      return prevParams;
    });
  }

  function handleRequesterChange(event: SyntheticEvent) {
    const newUserId = (event.target as HTMLSelectElement).value;
    setSearchParams((prevParams) => {
      if (newUserId) prevParams.set("userId", newUserId);
      else prevParams.delete("userId");
      return prevParams;
    });
  }

  function handleSearchChange(event: SyntheticEvent) {
    const newSearch = (event.target as HTMLInputElement).value;
    setSearchParams((prevParams) => {
      if (newSearch) prevParams.set("search", newSearch);
      else prevParams.delete("search");
      return prevParams;
    });
  }

  function handleSortToggle(column: string) {
    setSearchParams((prevParams) => {
      const currentSort = prevParams.get("sort");
      let newSort = `${column}_asc`;

      if (currentSort === `${column}_asc`) {
        newSort = `${column}_desc`;
      }

      prevParams.set("sort", newSort);
      return prevParams;
    });
  }

  function getSortIndicator(column: string) {
    const sort = searchParams.get("sort");
    if (sort === `${column}_asc`) return " ↑";
    if (sort === `${column}_desc`) return " ↓";
    return "";
  }

  return (
    <>
      <div className="d-flex flex-row gap-3 mb-4 w-100">
        <div className="d-flex flex-column flex-grow-1">
          <label htmlFor="search" className="form-label text-secondary mb-1">
            Search
          </label>
          <div className="input-group">
            <span className="input-group-text bg-white text-secondary pe-2 border-end-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </span>
            <input
              id="search"
              type="text"
              className="form-control border-start-0 ps-0"
              style={{ boxShadow: "none", borderColor: "#dee2e6" }}
              placeholder="Search..."
              value={searchParams.get("search") ?? ""}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="d-flex flex-column" style={{ width: "200px" }}>
          <label htmlFor="status" className="form-label text-secondary mb-1">
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
        <div className="d-flex flex-column" style={{ width: "250px" }}>
          <label htmlFor="userId" className="form-label text-secondary mb-1">
            Requested by
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
        <table className="table table-hover w-100 table rounded-4">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Description</th>

              <th scope="col" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSortToggle("status")}>
                Status{getSortIndicator("status")}
              </th>
              <th scope="col" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSortToggle("total")}>
                Total{getSortIndicator("total")}
              </th>

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
