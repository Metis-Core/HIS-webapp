# Suubi HIS staff guide

One page per role. Everything below is how the system behaves after Sprints 1 to 8.

## Everyone

- **Your status.** The chip in the top bar shows Available, Busy, On leave or Out of office. Click it to change.
  - Busy needs a length of time (30 min to 4 hours). You return to Available by yourself when it ends.
  - Leave and Out of office take a first and last day. Plan them ahead; you return automatically after the last day. Leave the last day empty to stay away until you mark yourself available.
  - "End now" or "Cancel" on a planned period undoes it.
- **Passwords.** At least 10 characters with a letter and a number. Common passwords are refused. Changing it signs you out everywhere else.
- **Lists.** Every list is paged with Previous and Next, newest first.

## Reception

1. Search the patient (name, MRN, phone or national ID). The selected patient shows in the box.
2. **Check in to see a doctor** adds the consultation fee. For lab, antenatal, birth or immunization, see Other check-ins below.
3. Emergency arrivals: choose Emergency. They are red until triage says otherwise and sit at the top of every queue.
4. Billing: open **Billing**, find the invoice, record the payment. Mobile money, card and insurance need a reference. Print the PDF receipt from the same drawer.
5. A patient waiting for a doctor can be moved: open the visit, **Change doctor**, pick a doctor who is available and give a reason.

## Other check-ins (lab, antenatal, birth, immunization)

Each button under **Check in a registered patient** skips triage and the consultation fee.

- **Lab tests only** opens the lab order form: pick the tests, priority and referring clinician. The tests are billed straight away and the patient goes to the lab.
- **Antenatal and birth** asks what the patient needs:
  - **Antenatal visit**: a pregnancy check-up. Free in a government programme, so the fee is 0 and shows as **Free** unless you set a fee in Services.
  - **Giving birth**: the delivery fee is billed now and the patient is sent to billing as well as to the maternity queue.
  - **Postnatal visit**: a check of the mother and baby after birth.
- **Immunization** goes straight to the queue. Routine vaccines are free, so nothing is billed at check-in; a private vaccine is billed when the nurse records it.
- A visit with only free services needs no payment. Fees are the services with codes ANTENATAL_VISIT, DELIVERY, POSTNATAL_VISIT and IMMUNIZATION in **Services**.

## Nurse (antenatal, birth and immunization)

Open the patient from the queue. For these visits the page shows **Antenatal, birth and immunization** with one button per form. Fields outside the normal range are flagged on the saved record.

- **Antenatal visit**: contact number (1 to 8 or more), gestation, blood pressure, fetal heart rate and presentation, swelling and pallor, haemoglobin, urine protein, HIV, syphilis and malaria tests, malaria prevention (IPTp), iron and folic acid, Td, mosquito net, deworming, danger signs and risk status.
- **Delivery**: time, gestation, place and mode of delivery, third stage, blood loss, tears, complications, and for the baby outcome, sex, weight, Apgar, resuscitation and whether the birth doses were given.
- **Postnatal visit**: mother's blood pressure, temperature, uterus, lochia, wound and breasts; baby's weight, cord, feeding and jaundice; danger signs and family planning.
- **Immunization**: pick the vaccine. The usual route and site fill in and the dose list narrows to the doses that exist. Add the batch number and expiry date and any reaction. The vaccines are the national schedule (BCG, hepatitis B birth dose, polio, DPT-HepB-Hib, PCV, rotavirus, IPV, malaria R21, measles-rubella, yellow fever, HPV, Td), which are free, and private vaccines (typhoid, hepatitis A and B, influenza, rabies, meningococcal, varicella), which are billed from Services.
- Check the schedule against the Ministry of Health poster your facility uses; the doses and ages are in the vaccine list the API serves.

## Nurse (triage)

1. **Waiting queue** lists patients ready for triage. Start triage, record vitals and acuity, save.
2. Saving finishes the triage stage: the patient leaves your list and is given to the available doctor with the fewest patients waiting.
3. Triage can only recommend a consultation. Only doctors send patients to the lab, radiology, pharmacy or surgery.

## Doctor

1. **Consultations** shows your patients: those assigned to you, plus any patient nobody was free to take.
2. Open the patient. You cannot open a consultation for a patient assigned to a colleague; ask reception to move the patient.
3. Examination and assessment is one field. Pick diagnoses from the ICD list.
4. Everything ordered is billed as it is ordered: the consultation fee (at check-in, or the moment you open the consultation if it was missed), lab tests, imaging and procedures, prescribed medicines and the admission fee. Cancelling an order or prescription removes its charge while it is unpaid. Order from the tabs: **Lab**, **Imaging & procedures** (pick from the catalogue; the price is billed automatically), **Prescriptions**. Lab results show only after the lab verifies them.
5. **Sign** the encounter to send the patient on (lab, radiology, pharmacy, admit). Signed encounters are locked; add an addendum for changes.
6. Going away? Set your status. Patients waiting for you are shared out to the other doctors straight away.

## Wards and admission

1. The doctor admits a patient when signing the encounter: tick **Admit patient to a ward**, give the ward and the reason, then sign. Only a doctor can admit.
2. Signing saves the admission, turns the patient into an inpatient and queues them at the ward first. The rest of the plan (lab, pharmacy and so on) follows after the ward.
3. The **Admission fee** (service code ADMISSION_FEE) is billed at that moment.
4. Bed days are not automatic yet. Billing adds **Ward bed, general (per day)** or **Ward bed, private (per day)** from the service list, with the number of days as the quantity.
5. A patient cannot be admitted twice for the same visit.
6. Not built yet: ward and bed lists, ward rounds and nursing notes, discharge and automatic bed-day billing.

## Laboratory

1. **Lab → Waiting**: call, enter results, verify. Abnormal and critical values are flagged from the age and sex of the patient.
2. Results are released to the doctor only after verification. Amendments keep a trail.
3. **Imaging & procedures** lists radiology and procedure orders: schedule, start, then fill in the findings from the test's template. For imaging also write the impression and classify the result as normal, abnormal or critical (the form suggests one from the flagged findings). Completed reports can be printed.

## Pharmacy

Dispense from the waiting queue. A patient leaves the pharmacy queue only when every prescription on the visit is dispensed.

## Accounts

- **Invoices** are itemised by department. Paying is done by recording payments; a charge becomes paid only when the invoice is fully paid.
- **Void** a wrong payment with a reason. It stays in the ledger marked void.
- **Day close-out**: at the end of the day, check the totals by method, count the cash drawer, close the day. A closed day cannot take new payments or voids. Only an administrator can reopen it.

## Administrators and managers

- **Users → Availability** shows who is around and lets you change anyone's status.
- Suspending or deleting a doctor moves their waiting patients to other doctors immediately.
- **Imaging & procedures → Catalogue** is where you add or edit what can be ordered: price, patient preparation and the result template. Only active entries appear in the doctor's picker.
- **Management** shows visits, money received and owed, waiting times by department, clinical activity, the live queue and each doctor's workload.
- Settings that need a decision are environment variables on the API: `PASSWORD_MIN_LENGTH` (8 to 32, default 10), `ATTACHMENTS_DIR`, `CORS_ORIGINS`, `TRUST_PROXY`.

## Staging check list

1. Register two patients, check both in, triage both. Each goes to a different available doctor.
2. Put one doctor on leave. Their waiting patients move.
3. Doctor orders a lab test, an X-ray and a prescription. Each shows in its queue without refreshing.
4. Lab verifies results; doctor sees them; radiology completes with findings.
5. Pharmacy dispenses; the patient leaves the queue.
6. Reception records a part payment by cash and the rest by mobile money; print the receipt.
7. Accounts voids one payment, records it again, closes the day, tries a payment on the closed day (refused), administrator reopens.
8. Management page shows the same numbers.
