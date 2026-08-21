import { useState, useEffect, SyntheticEvent } from "react";
import { IRequest } from "./IRequest";
import { requestAPI } from "./RequestAPI";
import { userAPI } from "../users/UserAPI";
import { IUser } from "../users/IUser";
import RequestRow from "./RequestRow";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useUserContext } from "../App";

const FILTER_STORAGE_KEY = "requestFilters";

function RequestTable() {
  const { user } = useUserContext();
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  const searchTerm = searchParams.get("search");
  const status = searchParams.get("status");
  const userId = searchParams.get("userId");
  const excludeUserId = searchParams.get("excludeUserId");
  const sort = searchParams.get("sort");

  // ✨ Quick View Active States
  // These strictly check the URL. If the user touches a dropdown, these automatically update!
  const isEverything = !status && !userId && !excludeUserId;
  const isSubmittedByYou = userId === String(user?.id) && !status && !excludeUserId;
  const isAwaitingReview = status === "REVIEW" && excludeUserId === String(user?.id) && !userId;

  useEffect(() => {
    const currentParams = searchParams.toString();

    if (currentParams) {
      sessionStorage.setItem(FILTER_STORAGE_KEY, currentParams);
    } else {
      const rememberedFilters = sessionStorage.getItem(FILTER_STORAGE_KEY);

      if (rememberedFilters) {
        setSearchParams(new URLSearchParams(rememberedFilters), {
          replace: true,
        });
      }
    }

    setFiltersInitialized(true);
  }, []);

  useEffect(() => {
    if (!filtersInitialized) return;

    const currentParams = searchParams.toString();

    if (currentParams) {
      sessionStorage.setItem(FILTER_STORAGE_KEY, currentParams);
    } else {
      sessionStorage.removeItem(FILTER_STORAGE_KEY);
    }
  }, [searchParams, filtersInitialized]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await userAPI.list();
        setAllUsers(data);
      } catch (error: any) {
        toast.error("Could not load users for the dropdown.", {
          duration: 6000,
        });
      }
    }

    loadUsers();
  }, []);

  async function loadRequests() {
    try {
      const data = await requestAPI.list(status ?? undefined, userId ?? undefined, excludeUserId ?? undefined, searchTerm ?? undefined, sort ?? undefined);

      setRequests(data);
    } catch (error: any) {
      toast.error(error.message, { duration: 6000 });
    }
  }

  useEffect(() => {
    if (!filtersInitialized) return;
    loadRequests();
  }, [filtersInitialized, status, userId, excludeUserId, searchTerm, sort]);

  function removeRequest(request: IRequest) {
    setRequests(requests.filter((r) => r.id !== request.id));
  }

  // ✨ Quick View Click Handlers
  function handleEverythingClick() {
    setSearchParams((prevParams) => {
      prevParams.delete("status");
      prevParams.delete("userId");
      prevParams.delete("excludeUserId");
      return prevParams;
    });
  }

  function handleSubmittedByYouClick() {
    setSearchParams((prevParams) => {
      prevParams.delete("status");
      prevParams.delete("excludeUserId");
      if (user?.id) prevParams.set("userId", String(user.id));
      return prevParams;
    });
  }

  function handleAwaitingReviewClick() {
    setSearchParams((prevParams) => {
      prevParams.delete("userId");
      prevParams.set("status", "REVIEW");
      if (user?.id) prevParams.set("excludeUserId", String(user.id));
      return prevParams;
    });
  }

  // Dropdown Handlers
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
    const selectedValue = (event.target as HTMLSelectElement).value;

    setSearchParams((prevParams) => {
      prevParams.delete("userId");
      prevParams.delete("excludeUserId");

      if (selectedValue === "anyone-else" && user?.id) {
        prevParams.set("excludeUserId", String(user.id));
      } else if (selectedValue) {
        prevParams.set("userId", selectedValue);
      }

      return prevParams;
    });
  }

  function handleSearchChange(event: SyntheticEvent) {
    const newSearch = (event.target as HTMLInputElement).value;

    setSearchParams((prevParams) => {
      if (newSearch) {
        prevParams.set("search", newSearch);
      } else {
        prevParams.delete("search");
      }
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

  function handleClearFilters() {
    sessionStorage.removeItem(FILTER_STORAGE_KEY);
    setSearchParams({});
  }

  function getSortIndicator(column: string) {
    if (sort === `${column}_asc`) return " ↑";
    if (sort === `${column}_desc`) return " ↓";
    return "";
  }

  const hasFilters = searchParams.toString().length > 0;

  function getRequesterValue() {
    if (excludeUserId) {
      return "anyone-else";
    }
    return userId ?? "";
  }

  // Helper to match the cute UI styles from the screenshot
  const getBtnClass = (isActive: boolean) => (isActive ? "btn btn-primary bg-primary-subtle text-primary border-primary-subtle fw-medium" : "btn btn-outline-secondary bg-white text-secondary");

  return (
    <>
      {/* ✨ The new Quick View Button Row! */}
      <div className="d-flex flex-row gap-2 mb-3">
        <button type="button" className={getBtnClass(isEverything)} onClick={handleEverythingClick}>
          Everything
        </button>

        <button type="button" className={getBtnClass(isSubmittedByYou)} onClick={handleSubmittedByYouClick}>
          Submitted by you
        </button>

        {user?.isReviewer && (
          <button type="button" className={getBtnClass(isAwaitingReview)} onClick={handleAwaitingReviewClick}>
            Awaiting your review
          </button>
        )}
      </div>

      <div className="d-flex flex-row gap-3 mb-4 w-100 align-items-end">
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
              style={{
                boxShadow: "none",
                borderColor: "#dee2e6",
              }}
              placeholder="Search..."
              value={searchTerm ?? ""}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="d-flex flex-column" style={{ width: "200px" }}>
          <label htmlFor="status" className="form-label text-secondary mb-1">
            Status
          </label>

          <select id="status" className="form-select" value={status ?? ""} onChange={handleStatusChange}>
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

          <select id="userId" className="form-select" value={getRequesterValue()} onChange={handleRequesterChange}>
            <option value="">Anyone</option>

            {user?.isReviewer && <option value="anyone-else">Anyone else</option>}

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

        <button type="button" className="btn btn-outline-secondary bg-white" onClick={handleClearFilters} disabled={!hasFilters}>
          Clear filters
        </button>
      </div>

      <section className="list d-flex flex-row flex-wrap bg-body-tertiary gap-5 p-4 rounded-4">
        {requests.length === 0 && searchTerm ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-secondary w-100 py-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="mb-3 opacity-50" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
            <p className="mb-0">No requests match "{searchTerm}". Try a different word, or clear the search.</p>
          </div>
        ) : requests.length === 0 && isAwaitingReview ? (
          // ✨ NEW: The "Nothing waiting on you" specific empty state!
          <div className="d-flex flex-column align-items-center justify-content-center text-secondary w-100 py-5">
            <p className="mb-0">Nothing is waiting on you.</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-secondary w-100 py-5">
            <p className="mb-0">No requests found.</p>
          </div>
        ) : (
          <table className="table table-hover w-100 table rounded-4 mb-0">
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
        )}
      </section>
    </>
  );
}

export default RequestTable;
