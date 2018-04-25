const { Transform } = require('stream');
const es = require('event-stream');

class EjParser extends Transform {
  constructor () {
    super({ objectMode: true });

    this._object = {};
    this.splitter = es.split(/[\r\n]+/);
    this.splitter.on('data', this._eachLine.bind(this));
  }

  _eachLine (line) {
    if (line.indexOf('MW>>') === -1) {
      return;
    }

    this.splitter.pause();
    try {
      line = line.split('MW>>')[1].trim();
      // console.log(line);
      let splitted = line.split(':');
      let key = splitted.length === 1 ? '__NOTE' : splitted[0].trim().replace(/[ /\\.]+/g, '_');
      let val = splitted.length === 1 ? splitted[0].trim() : splitted.slice(1).join(':').trim();

      if (key === 'TERMINAL') {
        this._flushLine();
      }

      this._object[key] = this._object[key] || [];
      this._object[key].push(val);

      this.splitter.resume();
    } catch (err) {
      // console.error('EACHLINE ERR', err);
      this.splitter._err = err;
      this.splitter.destroy(err);
    }
  }

  _transform (chunk, enc, cb) {
    this.splitter.write(chunk);
    cb();
  }

  _flush (cb) {
    if (this.splitter._err) {
      cb(this.splitter._err);
      return;
    }

    try {
      this._flushLine();
      cb();
    } catch (err) {
      // console.error('FLUSH ERR', err);
      cb(err);
    }
  }

  _flushLine () {
    if (Object.keys(this._object).length) {
      let row;
      if ('JML_TARIK' in this._object) {
        let accountType = '';
        if (this._object.TABUNGAN) {
          accountType = 'tabungan';
        }
        row = {
          tx_type: 'withdrawal',
          terminal: this._object.TERMINAL[0],
          timestamp: toDate(this._object.TGL_JAM[0]),
          receipt_no: this._object.NO_RESI[0],
          card_no: this._object.KARTU[0],
          account_type: accountType,
          from_acct_no: toAcctNo(this._object.NO_REK ? this._object.NO_REK[0] : this._object.TABUNGAN[0]),
          amount: toCurrency(this._object.JML_TARIK[0]),
          balance: toCurrency(this._object.SALDO_AKHIR[0]),
        };
      } else if ('INFO_SALDO' in this._object) {
        row = {
          tx_type: 'inquiry_balance',
          terminal: this._object.TERMINAL[0],
          timestamp: toDate(this._object.TANGGAL_JAM[0]),
          receipt_no: this._object.NO_RESI[0],
          card_no: this._object.KARTU[0],
          from_acct_no: toAcctNo(this._object.REKENING ? this._object.REKENING[0] : this._object.TABUNGAN[0]),
          balance: toCurrency(this._object.INFO_SALDO[0]),
        };
      } else if ('JML_TRANSF' in this._object) {
        if ('GIRO' in this._object) {
          row = {
            tx_type: 'inquiry_transfer',
            terminal: this._object.TERMINAL[0],
            timestamp: toDate(this._object.TANGGAL_JAM[0]),
            receipt_no: this._object.NO_RESI[0],
            card_no: this._object.KARTU[0],
            account_type: 'giro',
            to_acct_no: toAcctNo(this._object.REK_TUJUAN[0]),
            amount: toCurrency(this._object.JML_TRANSF[0]),
          };
        } else {
          row = {
            tx_type: 'transfer',
            terminal: this._object.TERMINAL[0],
            timestamp: toDate(this._object.TANGGAL_JAM[0]),
            receipt_no: this._object.NO_RESI[0],
            card_no: this._object.KARTU[0],
            from_acct_no: toAcctNo(this._object.REK_ASAL[0]),
            to_acct_no: toAcctNo(this._object.REK_TUJUAN[0]),
            amount: toCurrency(this._object.JML_TRANSF[0]),
            note1: toAcctNo(this._object.INQ_TUJUAN[0]),
          };
        }
      } else if ('PAYMENT' in this._object) {
        row = {
          tx_type: 'inquiry_payment',
          terminal: this._object.TERMINAL[0],
          timestamp: toDate(this._object.DATE_TIME[0]),
          trace_no: this._object.TRACE_NO[0],
          card_no: this._object.CARD[0],
          from_acct_no: toAcctNo(this._object.ACCOUNT[0]),
          amount: toCurrency(this._object.NAME[0]),
          note1: this._object.AMOUNT[0],
          note2: this._object.BILL_REF[0],
          note3: this._object.PAYMENT[0],
        };
      } else if ('JML_TAGIHAN' in this._object) {
        row = {
          tx_type: 'payment',
          terminal: this._object.TERMINAL[0],
          timestamp: toDate(this._object.DATE_TIME[0]),
          trace_no: this._object.TRACE_NO[0],
          card_no: this._object.NO_KARTU[0],
          note1: this._object.JML_TAGIHAN[0],
          note2: this._object.NO_HP[0],
          note3: this._object.__NOTE.join('\n'),
        };
      } else if ('TX_TYPE' in this._object) {
        row = {
          tx_type: this._object.TX_TYPE[0].replace(/[ ]+/g, '_').toLowerCase(),
          terminal: this._object.TERMINAL[0],
          timestamp: toDate(this._object.TANGGAL_JAM[0]),
          receipt_no: this._object.NO_RESI[0],
          card_no: this._object.KARTU[0],
          rcode: this._object.RCODE[0],
        };
      } else if ('RCODE' in this._object) {
        row = {
          tx_type: 'error',
          terminal: this._object.TERMINAL[0],
          timestamp: toDate(this._object.TANGGAL_JAM[0]),
          receipt_no: this._object.NO_RESI[0],
          card_no: this._object.KARTU[0],
          rcode: this._object.RCODE[0],
          note1: this._object.REASON[0],
        };
      } else {
        console.error('?', this._object);
        throw new Error('Unimplemented ej pattern handler');
      }

      if (row) {
        this.push(row);
      }
    }
    this._object = {};
  }
}

function toDate (v) {
  let [ dt, tm ] = v.split(' ');
  let [ d, m, y ] = dt.split('/');
  return new Date(`${y}-${m}-${d} ${tm}`);
}

function toAcctNo (v) {
  return v.replace(/-/g, '');
}

function toCurrency (v) {
  return Number(v.replace(/[.]/g, '').replace(/[,]/g, '.'));
}

module.exports = EjParser;
