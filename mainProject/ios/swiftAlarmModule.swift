//
//  iosAlarmModule.swift
//  labtest
//
//  Created by skku2 on 2020/08/31.
//

import Foundation
import UIKit
import UserNotifications
import EventKit
import AVFoundation
import MediaPlayer
import Firebase
import AudioToolbox

extension MPVolumeView {
    static func setVolume(_ volume: Float){
        let volumeView = MPVolumeView()
        let slider = volumeView.subviews.first(where: {$0 is UISlider}) as? UISlider
        
        DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + 0.01) {
            print("-----set volume to \(volume)")
            slider?.value = volume
        }
    }
}

class DbAlarmData: NSObject {
    
    var order: String
    var saveTime: String
    var setHour: String
    var setMin: String
    
    
    init(order: String,
    saveTime: String,
    setHour: String,
    setMin: String) {
        
        self.order = order
        self.saveTime = saveTime
        self.setHour = setHour
        self.setMin = setMin
    }
    
    convenience override init() {
        self.init(order: "",
        saveTime: "",
        setHour: "",
        setMin: "")
    }
}


@objc(swiftAlarmModule)
class swiftAlarmModule: UIViewController, UNUserNotificationCenterDelegate  {

//    @IBOutlet weak var myDatePicker: UIDatePicker!
    //    let appDelegate = UIApplication.shared.delegate as! AppDelegate

    
    //player
     var player: AVQueuePlayer?
    
    //soundFile Path
    var soundFilePath: URL?
    
    //looper: takes player
    var playerLooper: AVPlayerLooper?

    //time data
    var nowTimeHour: Int?
    var nowTimeMinute: Int?
    var targetHour: Int?
    var targetMinute: Int?

    //music file name
    var fullFileName: String?
    var fileName: String?
    var fileType: String?
    
    //player flag
    var isPlayConfirm = false

    //flag; just checking once or not?
    var justOnceCheckFlag = false

    //check flag; is it alarmed?
    var isAlarmRing: Bool = false
    
    //date when alarm is set
    var alarmSettingDate: Int?
    
    //flag; have to pop popscreen?
    var shouldPop: Bool = false
    
    //flag; after test?
    var isConfirmFromPop: Bool = false
    
    //firebase db
    var ref: DatabaseReference!
    
    //flag; firebase storage is downloaded?
    var isDownloadSoundFile: Bool = false
    
    
    //testNumber
    var testNumber: String?
    
    //timer
    var alarmTimer : Timer?
    var stopAlarmTimer: Timer?
    
    //should suspend app when alarm is on?
    var shouldSuspendApp: Bool = false;
    
    //backgroundTask Object
    var backgroundTask = BackgroundTask()
    
    //local storage
    let localStorage = UserDefaults.standard
    
    
    // MARK: 알람, 알림 초기화
    @objc func initAlarm() {
        backgroundTask.startBackgroundTask()
        
        var testFlag:Bool = true
        var soundFileName: String?
        //test 중이라 실제 음원 파일이 없을 때
        if testFlag{
            let sampleFileNumber = Int(Int(testNumber!)!/1000)
    
            soundFileName = String(sampleFileNumber) + ".mp3"
        }
        //release service
        else{
            soundFileName = testNumber! + ".mp3"
        }
        
        //firebase storage
        if !isDownloadSoundFile {
            print("start donwload soundfile")
            let storage = Storage.storage()
            
            // Create a reference with an initial file path and name
            let pathReference = storage.reference(withPath: "alarm")
//            let pathReference = storage.reference(forURL: "gs://labtest-6b089.appspot.com/alarm")
            
            // Create a reference to the file you want to download
            let soundFileRef = pathReference.child(soundFileName!)

            guard let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {return}

            let localURL = documentsDirectory.appendingPathComponent(soundFileName!)
            soundFilePath = localURL
            print(soundFilePath)
            // Create local filesystem URL
//            let localURL = URL(string: "file:///labtest")!

            // Download to the local filesystem
            let downloadTask = soundFileRef.write(toFile: localURL) { url, error in
              if let error = error {
                // Uh-oh, an error occurred!
                print("----------------------")
                print("Firebase Storage Error!! \(error)")
                print("----------------------")
              } else {
                // Local file URL for "images/island.jpg" is returned
                print("----------------------")
                print("Firebase Storage Download Complete!!")
                print("----------------------")
              }
            }
            
            downloadTask.observe(.success) { snapshot in
                print("----------------------")
                print("Observer: Firebase Storage Download Complete!!")
                print("----------------------")
              // Download completed successfully
                
                self.setPlayer()
                self.isDownloadSoundFile = true
            }
        }
        else{print("----------------------")
            print("already download soundfile")
            print("----------------------")
        }
        
        //set soundfile's name and type
        fileName = testNumber!
        fileType = "mp3"
        
        //firebase DB
        
        ref = Database.database().reference()
        
        ref.child("users").child(String(testNumber!) + "/alarm").queryOrdered(byChild: "order").queryLimited(toLast: 1).observeSingleEvent(of: .value, with: { (snapshot) in
          // Get user value
            let alarmDic = snapshot.value as? Dictionary<String, Any>
            print("snapshot data \(alarmDic)")
            
//            let firstKey = Array(alarmDic!)[0].key as String
//            print(alarmDic![firstKey]r!)
            
            if alarmDic != nil{
            let data = Array(alarmDic!)[0].value as AnyObject?
            let order = data?.object(forKey: "order") as AnyObject?
            
            
//            var data = alarmDic![firstKey].order
            
            
            var dbAlarmHour: Int = -1
            var dbAlarmMinute: Int = -1
        
            print("order is \(order!)")
            if order as! Int >= 1 {
                self.targetHour = data?.object(forKey: "setHour") as AnyObject? as? Int
                self.targetMinute = data?.object(forKey: "setMin") as AnyObject? as? Int
                
                dbAlarmHour = self.targetHour!
                dbAlarmMinute = self.targetMinute!
                
                print("dbAlarmHour: \(dbAlarmHour) dbAlarmMinute: \(dbAlarmMinute)")
            }
            
            if dbAlarmMinute == -1{
                print("db is nil!!!!!!!!!!")
            }
            
            
            self.checkAlarmCondition()
            }
            
            // ...
            }) { (error) in
            print(error.localizedDescription)
            }
        
        // Make dismiss for all VC that was presented from this start VC
//        self.children.forEach({vc in
//            print("Dismiss \(vc.description)")
//            vc.dismiss(animated: false, completion: nil)
//        })
        
        
        

        //AVAudioPlayer check time
//        player.addPeriodicTimeObserver(forInterval: CMTimeMake(value: 1, timescale: 100), queue: DispatchQueue.main) {
//            [weak self] time in
//            guard let self = self else { return }
//            let timeString = String(format: "%02.2f", CMTimeGetSeconds(time))
//r
//            if UIApplication.shared.applicationState == .active {
//                //            self.timeLabel.text = timeString
//            } else {
//                print("Background: \(timeString)")
//            }
//        }

//        stopTimer()
        
        //MARK: make scheduler to update time
        alarmTimer = Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: #selector(updateTime), userInfo: nil, repeats: true)
        

        // MARK: Notification Options
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge, .criticalAlert], completionHandler: { (didAllow, error) in
          
        })
//        UNUserNotificationCenter.current().delegate = self
        
        
    }
    
    func setPlayer(){
        self.player = self.makePlayer()
        //MARK: AVPlayer Sound Setting

        //looper를 통해 무한하게 음악 재생하게 설정
        self.playerLooper = AVPlayerLooper(player: player!, templateItem: songs[0])
        
        //AVAudioPlayer Setting
        do {
            try AVAudioSession.sharedInstance().setCategory(
              AVAudioSession.Category.playAndRecord,
              mode: .default,
              options: []
            )
        } catch {
            print("Failed to set audio session category.  Error: \(error)")
        }
        
        let session = AVAudioSession.sharedInstance()
        var _: Error?
        try? session.setCategory(AVAudioSession.Category.playback)
        try? session.setMode(AVAudioSession.Mode.voiceChat)
        
        try? session.overrideOutputAudioPort(AVAudioSession.PortOverride.speaker)
        
        try? session.setActive(true)
    }
    func stopTimer(){
        if alarmTimer != nil{
            alarmTimer?.invalidate()
            alarmTimer = nil
        }
        if stopAlarmTimer != nil{
            stopAlarmTimer?.invalidate()
            stopAlarmTimer = nil
        }
    }

//    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?)
//    {
//        if keyPath == "currentItem", let player = object as? AVPlayer,
//        let currentItem = player.currentItem?.asset as? AVURLAsset {
//        //        songLabel.text = currentItem.url.lastPathComponent
//        }
//    }

    //take song list
    private lazy var songs: [AVPlayerItem] = {
        let songNames = [fileName!]
        print("sound file name=\(fileName!) type=\(fileType!)")
        
        let url = soundFilePath!
        return [AVPlayerItem(url: url)]
    }()

    //make music player
    private func makePlayer() -> AVQueuePlayer {
        let player = AVQueuePlayer(items: songs)
        player.actionAtItemEnd = .advance
//        player.addObserver(self, forKeysPath: "currentItem", options: [.new, .initial] , context: nil)
        return player
    }
    
    @objc func confirmFromPopScreen(){
        // popscreen에서 입력이 들어왔음을 표시
        isConfirmFromPop = true

        // 더 이상 popscreen을 표시 안해도 된다고 표시
        shouldPop = false
        
        stopMusic()
        checkAlarmCondition()
    }
    
    @objc
    func isTimeToPop(_ callback: RCTResponseSenderBlock){
        print("isTimeToPop:return shouldPop=\(shouldPop)")
        callback([shouldPop])
    }
    
    //이전 알람 데이터를 확인해 flag들 조정
    @objc func checkAlarmCondition(){
        //알람이 아직 한번도 울리지 않았을 때
        if alarmSettingDate == nil{
            print("there's no alarmDate")
        }
        //알람이 울린적이 있을 때
        else{
            // set day of today
            let date = Date()
            let dateCompenents = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
            
            // get date of alarm ringing
            let alarmRingingDate = try localStorage.string(forKey: "alarmRingingDate")
            
            if alarmRingingDate != nil{
                print("checkCondition: localStorage alarmRingingDate = \(String(describing: alarmRingingDate))")
                print("checkCondition: dateCompenents.day=\(dateCompenents.day)")
                //alarm ringing today!
                if Int(alarmRingingDate!)! == dateCompenents.day! {
                    // 알람이 오늘 울렸으니까 플레이어 또한 이미 재생된적이 있다고 표시
                    isPlayConfirm = true
                    print("********")
                    print("alarm ringing today!!")
                }
                //alarm ringing other day!
                else{
                    // 최소한 알람이 울린 날짜에서 하루가 지났으므로
                    // 해당 날짜에 대한 정보들 삭제
                    // 플레이어는 아직 재생 안된거고
                    isPlayConfirm = false
                    
                    // 알람은 아직 안 울린거임
                    isAlarmRing = false
                    
                    // Popscreen에서 입력이 한번도 안 들어온거임
                    isConfirmFromPop = false
                    
                    // Popscreen을 띄우면 안됨
                    shouldPop = false
                    
                    print("********")
                    print("alarm ringing other day!!")
                }
            }
            else{
                print("there's no alarmRingingDate")
            }
            
            
            //알람이 울린 날과 현재 날짜가 동일한지 확인
            
            //현재 날짜 구하기
            let nowDate = dateCompenents.day // get today's date
        
//            print("checkAlarmCondition(): now date is \(alarmSettingDate)")
            
            // 오늘 알람을 맞췄는데 두번째로 맞춘 알람이 울릴 차례라면
            if isAlarmRing {
                // 오늘은 더 이상 알람을 울리면 안된다
                
            }
            
            // 오늘 알람이 이미 울렸는데 아직 popscreen에서 '예/아니오' 입력이 없다면
            if isAlarmRing && !isConfirmFromPop{
                //popscreen을 띄워저야한다
                print("Popscreen should pop")
                shouldPop = true
            }
            // isAlarmRing = false : 알람이 아직 안 울렸다면
            // !isConfirmFromPop = false : popscreen에서 '예/아니오' 입력이 있었다면
            else{
                
            }
            
            print("checkAlarmCondition(): isConfirmFromPop!!!!!!! \(isConfirmFromPop)")
        }
    }

    //MARK: update time data and check alarm
    @objc func updateTime(){
        print()
        var formatter = DateFormatter() // 특정 포맷으로 날짜를 보여주기 위한 변수 선언
        formatter.dateFormat = "HH" // hour format
        nowTimeHour = Int(formatter.string(from: Date()))

        formatter = DateFormatter() // 특정 포맷으로 날짜를 보여주기 위한 변수 선언
        formatter.dateFormat = "mm" // minute format
        nowTimeMinute = Int(formatter.string(from: Date()))

        formatter.dateFormat = "ss" // seconds format
        let nowSecond = formatter.string(from: Date())
        
        
        //get today's date
        formatter.dateFormat = "dd" // date format
        let nowDate = formatter.string(from: Date()) // get today's date
        
        print("hour=\(nowTimeHour!) minute=\(nowTimeMinute!) \(nowSecond) date=\(nowDate)flag=\(isPlayConfirm)")

        //update alarm flag
        checkAlarmCondition()
        
        print("isAlarmRing=\(isAlarmRing)")
        print("isConfirmFromPop=\(isConfirmFromPop)")
        print("isPlayConfirm=\(isPlayConfirm)")
        print("shouldPop=\(shouldPop)")
        
        //check alarm is ring
        if(isAlarmRing){
            return
        }
        
        //타겟 시간이 존재할 때만 알람 체크
        if targetHour != nil && targetMinute != nil && !isPlayConfirm{
            //현재 시간과 타겟 시간이 같다면?
            print("\(nowTimeHour! == targetHour!) and \(nowTimeMinute! == targetMinute!)")
            if nowTimeHour! == targetHour! && nowTimeMinute! == targetMinute!{
                makeNotification()
                isPlayConfirm = true
                isAlarmRing = true
                
                // Setting Storage

                // set day of today
                let date = Date()
                let dateCompenents = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
                print("type of dateCompenents = \(type(of: dateCompenents.day))")
                print("alarm ring at day \(String(describing: dateCompenents.day))")
                
                localStorage.set(dateCompenents.day, forKey: "alarmRingingDate")
                
                
                //volume MAX
                MPVolumeView.setVolume(1)
                player?.volume = 1
//                print("playMusic(): volume up claer")
                //play music
                player?.play()
                
                playMusic()

                // set log in firebase db
                saveLogToDB()
            
                //suspend app
                UIControl().sendAction(#selector(URLSessionTask.suspend), to: UIApplication.shared, for: nil)
            }
        }
        
        print()
    }
    
    
    func saveLogToDB(){
        print("===========")
        ref = Database.database().reference()
        
        let date = Date()
        let dateCompenents = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
        
        let dateString = "\(String(dateCompenents.year!))+\(String(dateCompenents.month!))+\(String(dateCompenents.day!))"
        
        let timestamp = DateFormatter.localizedString(from: Date(), dateStyle: .full, timeStyle: .full)
        let postLog = [
            "date" : timestamp
        ]
        
        
        let childUpdates = ["/users/\(String(describing: testNumber!))/log/alarOnDate/\(dateString)" : postLog]
        
        ref.updateChildValues(childUpdates as [AnyHashable : Any])
        print("===========")
    }
    
    
    //알람 소리 재생
    func playMusic(){
        //vibrate phone
        AudioServicesPlayAlertSoundWithCompletion(SystemSoundID(kSystemSoundID_Vibrate)) { }

        
        print("playMusic(): play clear")
        
        let asset = AVURLAsset(url: soundFilePath! as URL, options: nil)
        let audioDuration = asset.duration
        let audioDurationSeconds = CMTimeGetSeconds(audioDuration)

        //get length of music file
        let musicLength:Double = audioDurationSeconds

        print(musicLength)
//        print("playMusic(): schedule clear")
    }

    //알라 소리 멈추기
    @objc func stopMusic(){
        print("stopMusic(): stop!!!!")
        player?.pause()
        player?.seek(to: CMTime.zero)
    }
    
    @objc func getFileUrl() -> NSURL? {
        
        let path = Bundle.main.path(forResource: fileName!, ofType: fileType!)
        if let path = path {
                return NSURL(fileURLWithPath:path)
        } else {
                return nil
        }
    }

    //MARK: 타겟 시간(알람 시간) 설정
    @objc func setAlarmTime(_ hour:NSInteger, minute:NSInteger) -> Void{
        //swift datepicker에서 날짜, 시간 정보 가져오기
        
        print("-----Alarm Set!!------")
        print("alarm time: \(hour), \(minute)")
        targetHour = hour
        targetMinute = minute
        localStorage.set(hour, forKey: "hour")
        localStorage.set(minute, forKey: "minute")
        
        //get today's date
        //it's date when alarm is set
        // set day of today
        let date = Date()
        var dateCompenents = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
        
        print("alarm set at day \(dateCompenents.day)")
        localStorage.set(dateCompenents.day, forKey: "alarmSettingDate")
        
        alarmSettingDate =  dateCompenents.day// get today's date
        
        print("alarm setting date is \(alarmSettingDate)")
        
        DispatchQueue.global(qos: .background).async {
            //background code
//            self.selectNotification()
            DispatchQueue.main.async {
                //your main thread
            }
        }
    }
    
    
    //MARK: 상시 알람 시간 확인
    @objc func checkAlarm(_ number:NSString) -> Void{
        let notificationCenter = NotificationCenter.default
//        notificationCenter.addObserver(self, selector: #selector(appMovedToBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
//        notificationCenter.addObserver(self, selector: #selector(appMovedToBackground), name: UIApplication.willTerminateNotification, object: nil)
    

//        notificationCenter.addObserver(self,
//                                       selector: #selector(turnOnAlarmAtForeground),
//                                       name: NSNotification.Name(rawValue: "foregroundAlarmOn"),
//                                        object: nil)
//        notificationCenter.addObserver(self,
//                                    selector: #selector(turnOnAlarmAtBackground),
//                                    name: NSNotification.Name(rawValue: "backgroundAlarmOn"),
//                                     object: nil)
        //set hour and minute
        let tempHour = localStorage.string(forKey: "hour")
        let tempMinute = localStorage.string(forKey: "minute")
        
        // if localstorage has target hour and number, save it to app
        if tempHour != nil && tempMinute != nil{
            targetHour = Int(tempHour!)!
            targetMinute = Int(tempMinute!)!
        }
        
        //set testnumber
        testNumber = String(number)
        
        //set alarmDate
        let tempAlarmDate = localStorage.string(forKey: "alarmSettingDate")
        if tempAlarmDate != nil{
            alarmSettingDate = Int(tempAlarmDate!)
        }
        
        DispatchQueue.global(qos: .background).async {
            //background code
            
            DispatchQueue.main.async {
                //your main thread
                self.initAlarm()
            }
        }
//        DispatchQueue.main.async(execute: {
            
//        })
    }

    
    
    @objc func appMovedToBackground() {
        DispatchQueue.global(qos: DispatchQoS.QoSClass.default).async {
            
        }
    }



    //MARK:set alarm and notification
    @objc func makeNotification() {
        print("-----")
        print("make notification")
        
        //Setting content of the notification
        let content = UNMutableNotificationContent()
        content.title = NSString.localizedUserNotificationString(forKey: "알람이 울리고 있습니다!", arguments: nil)
        content.subtitle = "⭐️⭐️⭐️"
        content.body = NSString.localizedUserNotificationString(forKey: "이 알람을 누르거나 앱 아이콘을 터치하여 앱에 재진입해주세요!", arguments: nil)
        
        content.summaryArgument = "skku"
        content.summaryArgumentCount = 40
        content.sound = UNNotificationSound.default
//        let soundName = UNNotificationSoundName(rawValue: "Self-voice.aiff")
//        content.sound = UNNotificationSound.init(named: soundName)

        //Setting time for notification trigger
        //블로그 예제에서는 TimeIntervalNotificationTrigger을 사용했지만, UNCalendarNotificationTrigger사용법도 같이 올려놓을게요!

        //1. Use UNCalendarNotificationTrigger
        
        var dateCompenents = DateComponents()
        
        dateCompenents.hour = targetHour!
        dateCompenents.minute = targetMinute!
        dateCompenents.second = 0

        print("*******")
        print("targetHour=\(targetHour!) targetMinute=\(targetMinute!)")
        print(dateCompenents)
        print(content)
        print("*******")

        let calendartrigger = UNCalendarNotificationTrigger(dateMatching: dateCompenents, repeats: true)


        //2. Use TimeIntervalNotificationTrigger
        //시간 간격을 두고 time trigger 발생
        let TimeIntervalTrigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.1, repeats: false)

        //Adding Request
        // MARK: - identifier가 다 달라야만 Notification Grouping이 됩니닷..!!
        let request = UNNotificationRequest(identifier: "alarm", content: content, trigger: TimeIntervalTrigger)

        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
    }
}

