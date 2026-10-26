import { Dialog } from "@skryensya/react/dialog";
import { Button } from "@skryensya/react/button";

const CASES = [
  {
    label: "Demo",
    title: "Archive workspace?",
    body: "You can restore the workspace later.",
    cancel: "Cancel",
    confirm: "Archive",
    alert: false,
  },
  {
    label: "Worst case",
    title:
      "Remove international billing and security administrators from this workspace?",
    body: "Confirm with bartholomew.fitzgerald@northwind-industries-holdings.example.com before removing Aleksandra Wiśniewska-Kowalczyk. This action affects every workspace invoice and audit record.",
    cancel: "Keep workspace administrators",
    confirm: "Remove workspace administrators",
    alert: true,
  },
  {
    label: "Missing body",
    title: "Saved",
    body: "",
    cancel: "Close",
    confirm: "Continue",
    alert: false,
  },
  {
    label: "Long body",
    title: "Data retention and deletion requirements",
    body: "Workspace records include invoices, signed agreements, administrator activity and access logs. Before requesting deletion, confirm that Finance has exported outstanding invoices and that the security team has completed its access review. Records subject to a legal hold cannot be removed until the hold is released by an authorized administrator. Deletion requests are queued after the retention period and may take up to thirty days to finish. During that interval, administrators can cancel a request from workspace settings. Exports created before deletion remain the responsibility of the person who downloaded them. Backups expire on their existing schedule and are not restored into active workspaces except as part of disaster recovery. Members must be told which shared links will stop working and where replacement documents can be found. Billing administrators should retain the final invoice reference for reconciliation, even after access to the workspace ends. If a member belongs to other workspaces, this request does not remove their account or records from those workspaces. Contact the legal administrator if your organization needs a certificate of deletion or has different contractual retention requirements. By acknowledging this policy, you confirm that the necessary exports and notifications have been completed and that no active legal hold applies.",
    cancel: "Cancel",
    confirm: "Acknowledge",
    alert: false,
  },
];

export function DialogBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Dialog</h1>
        <p className="break-intro">
          Open each inline example: long titles, unbreakable contacts,
          translated-length actions, an empty body and a long policy. Escape
          closes the real modal.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, title, body, cancel, confirm, alert }, i) => {
          const id = `break-dialog-${i}`;
          return (
            <section className="break-case" key={label}>
              <h2 className="break-case__label">Dialog - {label}</h2>
              <div className="break-case__stage">
                <Button
                  onClick={() =>
                    (
                      document.getElementById(id) as HTMLDialogElement | null
                    )?.showModal()
                  }
                >
                  Open {label}
                </Button>
                <Dialog
                  id={id}
                  title={title}
                  alert={alert}
                  closeLabel="Close dialog"
                  footer={
                    <>
                      <Button
                        type="submit"
                        value="cancel"
                        autoFocus
                        variant="ghost"
                      >
                        {cancel}
                      </Button>
                      <Button type="submit" value="confirm">
                        {confirm}
                      </Button>
                    </>
                  }
                >
                  {body ? <p>{body}</p> : null}
                </Dialog>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
