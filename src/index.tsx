import {Grid, Form, Action, ActionPanel, Icon} from "@raycast/api";
import ip from 'ip'
import React, {useEffect, useState} from "react";
import {toDataURL} from "qrcode";

const Command = () => {
  const address = ip.address()
  const makeUrlString = (): string => {
    const BASE_URL = `http://${address}`
    return inputPort === '' ? BASE_URL : `${BASE_URL}:${inputPort}`
  }

  const [inputPort, setInputPort] = useState('')
  const [portError, setPortError] = useState<string | undefined>(undefined)
  const [url, setUrl] = useState(makeUrlString())

  const isValidPort = (value: string): boolean => {
    if (value === '') return true
    if (!/^\d*$/.test(value)) return false
    const RANGE_MIN = 1
    const RANGE_MAX = 65535
    const port = Number(value)
    return RANGE_MIN <= port && port <= RANGE_MAX
  }

  const onChangePort = (value: string) => {
    setInputPort(value)
    if (!isValidPort(value)) {
      setPortError('invalid port number')
      return
    }
    setPortError(undefined)
  }

  useEffect(() => {
    setUrl(makeUrlString())
  }, [inputPort])

  return <Form
    navigationTitle='generate development machine URL from local IP Address'
    actions={!portError && <ActionPanel>
        <Action.CopyToClipboard title="Copy Generated URL" content={url}/>
        <Action.OpenInBrowser url={url}/>
        <Action.Push title="Show URL QR Code" icon={Icon.Camera} target={<QRView url={url}/>}/>
        <Action.CopyToClipboard title="Copy IP Address" content={address}/>
    </ActionPanel>}
  >
    <Form.Description
      title='Generated URL'
      text={`${url}`}
    />
    <Form.Description
      title='IP Address'
      text={`${address}`}
    />
    <Form.TextField
      id="port"
      title="Port"
      placeholder="Enter port number"
      autoFocus={false}
      onChange={(value) => {
        onChangePort(value)
      }}
      error={portError}
    />
  </Form>
}

export default Command

type QRViewProps = {
  url: string
}

const QRView: React.FC<QRViewProps> = ({url}) => {
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    toDataURL(url, function (err, qr) {
      setQrCode(qr)
    })
  }, [])

  return <Grid
    navigationTitle={`QR Code. ${url}`}
    searchBarPlaceholder={''}
    enableFiltering={false}
    itemSize={Grid.ItemSize.Large} inset={Grid.Inset.Medium}>
    <Grid.Item content={qrCode}/>
  </Grid>
}
