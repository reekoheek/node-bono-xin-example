const { Transform } = require('stream');
const es = require('event-stream');

const STATE = {
  VOID: 0,
  PREDETAIL: 1,
  DETAIL: 2,
};

const DETAIL_RE = /^(.{8})(.{9})(.{8})(.{8})(.{8})(.{12})(.{17})(.{9})(.{21})(.{26})(.{12})(.{17})(.{10})(.{7})(.{15})(.{14})(.{13})(.{26})(.{22})(.{11})(.{11})(.{10})$/;

class AtmbParser extends Transform {
  constructor () {
    super({ objectMode: true });

    this._state = STATE.VOID;

    this.splitter = es.split();

    this.splitter.on('data', this._digest.bind(this));
  }

  _transform (chunk, enc, cb) {
    this.splitter.write(chunk);
    cb();
  }

  _digest (line) {
    line = line.trim();

    if (this._state === STATE.PREDETAIL) {
      this._state = STATE.DETAIL;
      return;
    }

    if (this._state === STATE.DETAIL) {
      if (line.startsWith('-')) {
        this._state = STATE.VOID;
        return;
      }

      this._parseDetail(line);
      return;
    }

    if (line.startsWith('REPORT ID')) {
      this.currentReportId = line.split(':')[1].trim();
    // } else if (line.startsWith('REPORT DATE')) {
    //   this.currentReportDate = line.split(':')[1].trim();
    // } else if (line.startsWith('BANK/INSTITUTION')) {
    //   this.bankId = line.split(':')[1].split('-')[0].trim();
    } else if (line.startsWith('TR_DATE')) {
      this._state = STATE.PREDETAIL;
    }
  }

  _parseDetail (line) {
    let result = line.match(DETAIL_RE);
    let [ tranCode, ...tranFlags ] = result[11].trim().split(/\s+/);
    let [ tranResult1 = '', tranResult2 = '' ] = result[14].trim().split('/');
    let [ tranTraceNo1 = '', tranTraceNo2 = '' ] = result[15].trim().split('/');

    // console.log(line);
    // console.log(result);
    let row = {
      timestamp: new Date(`20${result[0].substr(0, 2)}-${result[0].substr(2, 2)}-${result[0].substr(4, 2)}T${result[1].substr(0, 2)}:${result[1].substr(2, 2)}:${result[1].substr(4, 2)}`),
      report_id: this.currentReportId,
      acq_id: result[3].trim(),
      iss_id: result[4].trim(),
      bnf_id: result[5].trim(),
      bnf_mbr_id: result[6].trim(),
      terminal_id: result[7].trim(),
      terminal_code: result[8].trim(),
      card_no: result[9].trim(),
      from_acct_no: result[10].trim(),
      tran_code: tranCode,
      is_inq: tranFlags.indexOf('I') !== -1,
      is_rev: tranFlags.indexOf('R') !== -1,
      is_db: tranFlags.indexOf('D') !== -1,
      is_cr: tranFlags.indexOf('C') !== -1,
      amount: Number(result[12].trim().split(',').join('')),
      kurs: result[13].trim(),
      result1: tranResult1,
      result2: tranResult2,
      trace_no1: tranTraceNo1,
      trace_no2: tranTraceNo2,
      ref_no: result[16].trim(),
      receipt_no: result[17].trim(),
      to_acct_no: result[18].trim(),
      cust_ref_no: result[19].trim(),
      acq_fee: Number(result[20].trim().split(',').join('')),
      bnf_fee: Number(result[21].trim().split(',').join('')),
      swt_fee: Number(result[22].trim().split(',').join('')),
    };

    this.push(row);
  }
}

module.exports = AtmbParser;
