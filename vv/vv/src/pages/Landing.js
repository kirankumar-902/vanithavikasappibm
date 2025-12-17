import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SimpleHero from '../components/SimpleHero';
import Services from '../components/Services';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import UserTypeModal from '../components/UserTypeModal';

const Landing = ({ navigation }) => {
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);

  const handleGetStarted = () => {
    setShowUserTypeModal(true);
  };

  const handleSelectUserType = (userType) => {
    setShowUserTypeModal(false);
    navigation?.navigate('Signup', { userType });
  };

  const handleLogin = () => {
    navigation?.navigate('Login');
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <SimpleHero 
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
        <Services />
        <Features />
        <Testimonials />
        <Footer />
      </ScrollView>
      
      <UserTypeModal
        visible={showUserTypeModal}
        onClose={() => setShowUserTypeModal(false)}
        onSelectUserType={handleSelectUserType}
      />
    </View>
  );
};

export default Landing;
