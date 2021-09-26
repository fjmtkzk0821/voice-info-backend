module.exports.basic = (role) => {
    return {
        public: false,
        role: role,
        avatar: ['',''],
        name: '',
        gender: '',
        intro: '',
        twitter: '',
        email: '',
        page: ''
    }
}

module.exports.seiyu = () => {
    return {
        able: {
            R: false,
            R15: false,
            R18: false,
        },
        jozu: [],
        wish: [],
        equip: '',
        experiences: '',
        feeDetail: '',
        otherDetail: '',
        precaution: '',
        statusDetail: '',
        hires: false
    }
}

module.exports.circle = () => {
    return {
        equip: '',
        experiences: '',
        dlsite: ''
    }
}