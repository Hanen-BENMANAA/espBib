// Small stub for exporting (PDF/Excel) - integrate a library (pdfkit, exceljs) later
module.exports = {
  exportReportsToCsv: async (reports) => {
    // naive csv
    const header = ['id','title','author','status','submissionDate'];
    const lines = reports.map(r => [r.id, `"${(r.title||'')}"`, `${r.authorFirstName||''} ${r.authorLastName||''}`, r.status, r.submissionDate].join(','));
    return [header.join(','), ...lines].join('\n');
  }
};