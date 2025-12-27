import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import {
  TOKENS,
  useServices,
  HomeStackParams,
  Screens,
} from '@bifold/core'

const Stack = createStackNavigator<HomeStackParams>()

const DigiCredHomeStack: React.FC = () => {
  const [Home] = useServices([TOKENS.SCREEN_HOME])

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

export default DigiCredHomeStack
