import Link from 'next/link'
import { parse } from 'node-html-parser';
import axios from 'axios';

export default function Home() {
  return (
    <div>
      <Link href="/api/parse">
        <a>Start Parsing m.sporx.com</a>
      </Link>
      <br />
      <Link href="/api/parse2">
        <a>Start Parsing www.mackolik.com</a>
      </Link>
      <br />
      <Link href="/api/download">
        <a>Download last report</a>
      </Link>
    </div>
  )
}
