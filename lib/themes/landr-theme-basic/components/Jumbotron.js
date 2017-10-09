import React from 'react'
import styled, { withTheme } from 'styled-components'
import get from 'lodash/get'
import StarIcon from 'react-icons/lib/go/star'
import TweetIcon from 'react-icons/lib/ti/social-twitter-circular'
import { Heading, Button, Text, Banner, Image } from 'resin-components'
import Link from 'components/Link'
import images from 'images'
import DownloadButton from 'components/DownloadButton'

export default (props) => {
  const latestRelease = props.releases[0]
  const latestAssets  = get(latestRelease, 'assets')
  const version = get(latestRelease, 'tag_name')
  return (
    <Banner bg={props.theme.colors.gray.dark} color='white'>
      <Heading.h1 mt={5}>{props.config.settings.lead || props.repository.name}</Heading.h1>
      <Heading.h4 weight={'100'} mb={3}>{props.repository.description}</Heading.h4>
      {
        latestAssets && <DownloadButton assets={latestAssets} />
      }
      <Text my={3}>{version && `${version} - `}<Link to='/changelog/'>See whats new</Link></Text>
      {
        images[`./screenshot.gif`] && <Image src={images[`./screenshot.gif`]} />
      }
    </Banner>
  )
}