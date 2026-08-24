import { IRequest } from "./IRequest";
import { IUser } from "../users/IUser";

interface RequestHeaderProps {
  request: IRequest;
  user: IUser | undefined;
}

function RequestHeader({ request, user }: RequestHeaderProps) {
  return (
    <div className="card mb-4 border-0 bg-body-tertiary rounded-4">
      <div className="card-body p-4">
        <div className="row g-4">
          <div className="col-md-4">
            <h6 className="text-secondary mb-1">Description</h6>
            <p className="fw-medium mb-0">{request.description}</p>
          </div>

          <div className="col-md-4">
            <h6 className="text-secondary mb-1">Justification</h6>
            <p className="fw-medium mb-0">{request.justification || "None provided"}</p>
          </div>

          <div className="col-md-4">
            <h6 className="text-secondary mb-1">Delivery Mode</h6>
            <p className="fw-medium mb-0">{request.deliveryMode}</p>
          </div>

          <div className="col-md-4">
            <h6 className="text-secondary mb-1">Status</h6>
            <span className={`badge px-3 py-2 ${request.status === "APPROVED" ? "bg-success" : request.status === "REJECTED" ? "bg-danger" : "bg-warning text-dark"}`}>{request.status}</span>
          </div>

          <div className="col-md-4">
            <h6 className="text-secondary mb-1">Total</h6>
            <p className="fw-medium mb-0">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(request.total || 0)}</p>
          </div>

          <div className="col-md-4">
            <h6 className="text-secondary mb-1">Requested By</h6>
            <p className="fw-medium mb-0">{user ? `${user.firstName} ${user.lastName}` : "Unknown"}</p>
          </div>

          {request.status === "REJECTED" && request.rejectionReason && (
            <div className="col-12 mt-3 p-3 bg-white border border-danger-subtle rounded-3">
              <h6 className="text-danger mb-1">Rejection Reason</h6>
              <p className="text-danger mb-0">{request.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestHeader;
